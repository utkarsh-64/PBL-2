import os
import asyncio
import json
import tempfile
import uuid
import requests
import re
from typing import List, Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.runnables import RunnableSequence
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec

from users.models import UserData, IncomeStatus, RetirementInfo
from chatbot.models import Chat
from chatbot.prompts import (
    ANSWER_USER_QUERY_PROMPT,
    INTERPRETER_USER_REQUEST,
    EXTRACT_USER_INFO_PROMPT,
    SEARCH_QUERY_GENERATOR_PROMPT,
)
from chatbot.utils.text_utils import extract_json_from_text

from config import GOOGLE_API_KEY
from dotenv import load_dotenv

load_dotenv()


class ChatBot:
    def __init__(self, chat_id: int, user_id: int):
        # self.chat = Chat.objects.get(id=chat_id)
        self.user_id = user_id

        # Initialize Pinecone and embeddings
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "pension-chatbot")

        # Initialize Pinecone client
        if self.pinecone_api_key:
            self.pc = Pinecone(api_key=self.pinecone_api_key)
            self._initialize_pinecone_index()
        else:
            self.pc = None
            print(
                "Warning: Pinecone API key not found. RAG functionality will be disabled."
            )

        # Initialize embeddings model
        try:
            asyncio.get_running_loop()
        except RuntimeError:
            asyncio.set_event_loop(asyncio.new_event_loop())
        from google import genai as google_genai

        # Force v1beta API as new API keys only support 2.5 models
        self.genai_client = google_genai.Client(
            api_key=GOOGLE_API_KEY,
            http_options={"api_version": "v1beta"},
        )

        # Custom embedder using google.genai SDK directly (v1beta)
        class _DirectEmbedder:
            def __init__(self, client, model):
                self.client = client
                self.model = model

            def embed_query(self, text):
                from google.genai import types as genai_types
                response = self.client.models.embed_content(
                    model=self.model,
                    contents=text,
                    config=genai_types.EmbedContentConfig(output_dimensionality=1024)
                )
                return response.embeddings[0].values

            def embed_documents(self, texts):
                return [self.embed_query(t) for t in texts]

        self.embeddings = _DirectEmbedder(self.genai_client, "models/gemini-embedding-2-preview")

        # Text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def _initialize_pinecone_index(self):
        """Initialize Pinecone index if it doesn't exist."""
        try:
            # Check if index exists
            existing_indexes = [index.name for index in self.pc.list_indexes()]

            if self.index_name not in existing_indexes:
                # Create index with appropriate dimensions for Google embeddings
                self.pc.create_index(
                    name=self.index_name,
                    dimension=768,  # Google text-embedding-004 dimension
                    metric="cosine",
                    spec=ServerlessSpec(cloud="aws", region=self.pinecone_environment),
                )
                print(f"Created Pinecone index: {self.index_name}")

            # Connect to the index
            self.index = self.pc.Index(self.index_name)
        except Exception as e:
            print(f"Error initializing Pinecone index: {e}")
            self.index = None

    def reply(self, user_message, file):
        has_uploaded_document = True if file else False

        # Save user message to chat history
        self._save_message_to_history(user_message, "user")

        # First, determine user intent before processing any files
        intent = self._get_message_intent(user_message, has_uploaded_document)

        if intent.get("category") == "INCOMPLETE_REQUEST":
            response = "Can you elaborate on it or try rephrasing it?"
            self._save_message_to_history(response, "assistant")
            return response

        # Handle extraction request - process PDF for extraction only
        if intent.get("category") == "EXTRACT_USER_INFO_FROM_DOCUMENT":
            if file and self._is_pdf_file(file):
                extraction_result = self._extract_user_info_from_pdf(file)
                # self._save_message_to_history(f"{extraction_result}", "assistant")
                return extraction_result
            response = "Please upload a PDF document to extract your information."
            self._save_message_to_history(response, "assistant")
            return response

        # Handle resource requests - search for external resources
        if intent.get("category") == "RESOURCE_REQUEST":
            topic = intent.get("topic", user_message)
            resources = self._search_external_resources(topic)
            self._save_message_to_history(f"Found resources for: {topic}", "assistant")
            return resources

        # Handle questions or general queries - process PDF for RAG if needed
        if intent.get("category") in ["QUESTION", "GENERAL"]:
            # Process PDF for RAG only if it's a question/general query and file is uploaded
            if file and self._is_pdf_file(file):
                pdf_processing_result = self._process_pdf_file(file)
                if pdf_processing_result:
                    # Continue to answer the question using the processed PDF
                    pass
                else:
                    response = "I encountered an issue processing your PDF, but I'll try to answer your question with available information."
                    self._save_message_to_history(response, "assistant")

            answer = self._answer_user_query(user_message, file)
            self._save_message_to_history(answer, "assistant")
            return answer

        response = "Can you rephrase your question properly."
        self._save_message_to_history(response, "assistant")
        return response

    def _llm_generate(self, prompt: str, temperature: float = 0.6) -> str:
        """Generate text using google.genai SDK directly with v1 endpoint."""
        from google.genai import types as genai_types
        response = self.genai_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=temperature,
            ),
        )
        return response.text or ""

    def _answer_user_query(
        self, user_message: str, file=None, max_history_messages=10
    ) -> str:
        """
        Answers a user query by providing context from IncomeStatus, RetirementInfo, conversation history, and RAG.
        If no context exists, still tries to answer the query.

        Args:
            user_message: The current user message
            file: Optional file attachment
            max_history_messages: Maximum number of previous messages to include in context
        """

        # Build context from DB
        context_parts = []
        try:
            basic_data = UserData.objects.filter(user_id=self.user_id).first()
            if basic_data:
                context_parts.append(
                    f"""
                    User Info:
                    - Date of Birth: {basic_data.dateOfBirth}
                    - Gender: {basic_data.gender}
                    - Location: {basic_data.location}
                    - Marital Status: {basic_data.maritalStatus}
                    - Number of Dependents: {basic_data.numberOfDependants}
                    """
                )
            income_status = IncomeStatus.objects.filter(user_id=self.user_id).first()
            if income_status:
                context_parts.append(
                    f"""
                    Income Information:
                    - Current Salary: {income_status.currentSalary}
                    - Years of Service: {income_status.yearsOfService}
                    - Employer Type: {income_status.employerType}
                    - Pension Scheme: {income_status.pensionScheme}
                    - Pension Balance: {income_status.pensionBalance}
                    - Employer Contribution: {income_status.employerContribution or "Not provided"}
                    """
                )

            retirement_info = RetirementInfo.objects.filter(
                user_id=self.user_id
            ).first()
            if retirement_info:
                context_parts.append(
                    f"""
                    Retirement Plan:
                    - Planned Retirement Age: {retirement_info.plannedRetirementAge}
                    - Lifestyle Goal: {retirement_info.retirementLifestyle}
                    - Estimated Monthly Expenses in Retirement: {retirement_info.monthlyRetirementExpense}
                    - Legacy Goal: {retirement_info.legacyGoal}
                    - Plan Created At: {retirement_info.created_at}
                    """
                )

        except Exception as e:
            print("Error while fetching user context:", e)

        # Build conversation history context
        history_context = self._get_conversation_history(max_history_messages)
        if history_context:
            context_parts.append(f"Recent Conversation History:\n{history_context}")

        # Get relevant context from RAG (Pinecone)
        rag_context = self._get_rag_context(user_message)
        if rag_context:
            context_parts.append(f"Relevant Document Information:\n{rag_context}")

        # Merge context
        context = (
            "\n".join(context_parts)
            if context_parts
            else "No user income or retirement information available."
        )

        prompt = ANSWER_USER_QUERY_PROMPT.format(
            user_query=user_message.strip(), context=context
        )

        try:
            return self._llm_generate(prompt, temperature=0.6)
        except Exception as e:
            print("An error occurred while generating a response: ", e)
            return "An error occurred while generating a response"

    def _get_message_intent(self, user_message, has_uploaded_document=False):
        prompt = INTERPRETER_USER_REQUEST.format(
            user_message=user_message.strip(),
            has_uploaded_document=has_uploaded_document,
        )
        interpreter_llm = None  # no longer needed
        response = self._llm_generate(prompt, temperature=0.7)

        try:
            data = extract_json_from_text(response)

            if "category" not in data:
                return {"category": "INCOMPLETE"}

            return data

        except Exception as e:
            print(f"An error occurred: {e}")
            return {"category": "INCOMPLETE", "error": str(e)}

    def _get_conversation_history(self, max_messages=10) -> str:
        """
        Retrieves recent conversation history for the user.

        Args:
            max_messages: Maximum number of messages to retrieve

        Returns:
            Formatted conversation history string
        """
        try:
            # Get recent chat messages for this user, ordered by creation time (newest first)
            recent_chats = Chat.objects.filter(user_id=self.user_id).order_by(
                "-created_at"
            )[:max_messages]

            if not recent_chats:
                return ""

            # Reverse to get chronological order (oldest first)
            recent_chats = list(reversed(recent_chats))

            history_parts = []
            for chat in recent_chats:
                sender_label = "User" if chat.sender == "user" else "Assistant"
                history_parts.append(f"{sender_label}: {chat.content}")

            return "\n".join(history_parts)

        except Exception as e:
            print(f"Error retrieving conversation history: {e}")
            return ""

    def _save_message_to_history(self, message: str, sender: str):
        """
        Saves a message to the chat history.

        Args:
            message: The message content to save
            sender: Either 'user' or 'assistant'
        """
        try:
            Chat.objects.create(user_id=self.user_id, sender=sender, content=message)
        except Exception as e:
            print(f"Error saving message to history: {e}")

    def _is_pdf_file(self, file) -> bool:
        """Check if the uploaded file is a PDF."""
        if hasattr(file, "name"):
            return file.name.lower().endswith(".pdf")
        elif hasattr(file, "content_type"):
            return file.content_type == "application/pdf"
        return False

    def _process_pdf_file(self, file) -> Optional[str]:
        """
        Process PDF file: extract text and store chunks in memory for context retrieval.
        Uses simple in-memory storage instead of Pinecone for broad compatibility.

        Args:
            file: The uploaded PDF file

        Returns:
            Success message or None if failed
        """
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            # Load and process PDF
            loader = PyPDFLoader(temp_file_path)
            documents = loader.load()

            # Split documents into chunks and store in-memory
            chunks = self.text_splitter.split_documents(documents)

            # Store chunks in memory on this ChatBot instance
            self._doc_chunks = [
                {
                    "content": chunk.page_content,
                    "source": getattr(file, "name", "uploaded_pdf"),
                    "page": chunk.metadata.get("page", 0),
                }
                for chunk in chunks
            ]

            # Clean up temporary file
            os.unlink(temp_file_path)

            return f"Processed {len(chunks)} chunks from PDF and ready for questions."

        except Exception as e:
            print(f"Error processing PDF file: {e}")
            try:
                if "temp_file_path" in locals():
                    os.unlink(temp_file_path)
            except (OSError, FileNotFoundError):
                pass
            return None

    def _get_rag_context(self, query: str, top_k: int = 5) -> str:
        """
        Retrieve relevant context from in-memory document chunks using keyword matching.

        Args:
            query: The user's query
            top_k: Number of top chunks to retrieve

        Returns:
            Formatted context string from retrieved documents
        """
        chunks = getattr(self, "_doc_chunks", None)
        if not chunks:
            return ""

        try:
            # Simple keyword relevance scoring
            query_words = set(query.lower().split())
            scored = []
            for chunk in chunks:
                content_lower = chunk["content"].lower()
                score = sum(1 for w in query_words if w in content_lower)
                scored.append((score, chunk))

            # Sort by score descending, take top_k
            scored.sort(key=lambda x: x[0], reverse=True)
            top_chunks = [c for _, c in scored[:top_k] if _ > 0] or [c for _, c in scored[:3]]

            context_parts = [
                f"From {c['source']} (Page {c['page']}):\n{c['content']}"
                for c in top_chunks
            ]
            return "\n\n".join(context_parts)

        except Exception as e:
            print(f"Error retrieving RAG context: {e}")
            return ""

    def _extract_user_info_from_pdf(self, file) -> str:
        """
        Extract user information from PDF document using LLM.

        Args:
            file: The uploaded PDF file

        Returns:
            JSON string with extracted user information or error message
        """
        try:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name

            # Load and extract text from PDF
            loader = PyPDFLoader(temp_file_path)
            documents = loader.load()

            # Combine all pages into one text
            full_text = "\n".join([doc.page_content for doc in documents])

            # Clean up temporary file
            os.unlink(temp_file_path)

            # Use LLM to extract structured information
            prompt = EXTRACT_USER_INFO_PROMPT.format(document_text=full_text)
            extracted_text = self._llm_generate(prompt, temperature=0.1)

            # Try to extract JSON from the response
            try:
                extracted_data = extract_json_from_text(extracted_text)
                if extracted_data:
                    return extracted_data
                else:
                    return "I couldn't extract structured information from the document. The document might not contain the expected personal/financial information."
            except Exception as json_error:
                print(f"Error parsing extracted JSON: {json_error}")
                return f"I found some information in the document but couldn't format it properly. Raw response: {extracted_text}"

        except Exception as e:
            print(f"Error extracting user info from PDF: {e}")
            # Clean up temporary file if it exists
            try:
                if "temp_file_path" in locals():
                    os.unlink(temp_file_path)
            except (OSError, FileNotFoundError):
                pass
            return "Sorry, I encountered an error while processing your document. Please make sure it's a valid PDF file."

    def _search_external_resources(self, topic: str) -> Dict[str, Any]:
        """
        Search for external resources (YouTube videos and blog articles) on the given topic.

        Args:
            topic: The topic to search for

        Returns:
            Dictionary containing search results with videos and articles
        """
        try:
            # Generate optimized search queries
            search_queries = self._generate_search_queries(topic)

            resources = {
                "topic": topic,
                "youtube_videos": [],
                "blog_articles": [],
                "message": f"Here are some educational resources about {topic}:",
            }

            # Search YouTube videos
            if search_queries.get("youtube_query"):
                youtube_results = self._search_youtube(search_queries["youtube_query"])
                resources["youtube_videos"] = youtube_results

            # Search for blog articles
            if search_queries.get("blog_query"):
                blog_results = self._search_google_articles(
                    search_queries["blog_query"]
                )
                resources["blog_articles"] = blog_results

            return resources

        except Exception as e:
            print(f"Error searching external resources: {e}")
            return {
                "topic": topic,
                "youtube_videos": [],
                "blog_articles": [],
                "message": "I encountered an issue while searching for resources. Please try again later.",
                "error": str(e),
            }

    def _generate_search_queries(self, topic: str) -> Dict[str, str]:
        """
        Generate optimized search queries for the given topic.

        Args:
            topic: The topic to generate queries for

        Returns:
            Dictionary with optimized search queries
        """
        try:
            prompt = SEARCH_QUERY_GENERATOR_PROMPT.format(topic=topic)
            raw = self._llm_generate(prompt, temperature=0.3)
            queries = extract_json_from_text(raw)
            return (
                queries
                if queries
                else {
                    "youtube_query": f"{topic} explained",
                    "blog_query": f"{topic} guide tutorial",
                }
            )

        except Exception as e:
            print(f"Error generating search queries: {e}")
            return {
                "youtube_query": f"{topic} explained",
                "blog_query": f"{topic} guide tutorial",
            }

    def _search_youtube(self, query: str, max_results: int = 5) -> List[Dict[str, str]]:
        """
        Search YouTube for videos related to the query.

        Args:
            query: Search query
            max_results: Maximum number of results to return

        Returns:
            List of video information dictionaries
        """
        try:
            # Use YouTube Data API if available, otherwise use a simple search approach
            youtube_api_key = os.getenv("YOUTUBE_API_KEY")

            if youtube_api_key:
                return self._search_youtube_api(query, youtube_api_key, max_results)
            else:
                # Fallback: return structured search suggestions
                return self._generate_youtube_suggestions(query, max_results)

        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []

    def _search_youtube_api(
        self, query: str, api_key: str, max_results: int
    ) -> List[Dict[str, str]]:
        """
        Search YouTube using the official API.

        Args:
            query: Search query
            api_key: YouTube Data API key
            max_results: Maximum number of results

        Returns:
            List of video information
        """
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "key": api_key,
                "order": "relevance",
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            videos = []

            for item in data.get("items", []):
                video_info = {
                    "title": item["snippet"]["title"],
                    "description": (
                        item["snippet"]["description"][:200] + "..."
                        if len(item["snippet"]["description"]) > 200
                        else item["snippet"]["description"]
                    ),
                    "video_id": item["id"]["videoId"],
                    "url": f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                    "channel": item["snippet"]["channelTitle"],
                }
                videos.append(video_info)

            return videos

        except Exception as e:
            print(f"Error with YouTube API search: {e}")
            return []

    def _generate_youtube_suggestions(
        self, query: str, max_results: int
    ) -> List[Dict[str, str]]:
        """
        Generate YouTube search suggestions when API is not available.

        Args:
            query: Search query
            max_results: Maximum number of suggestions

        Returns:
            List of search suggestions
        """
        suggestions = [
            {
                "title": f"Search YouTube for: {query}",
                "description": "Click to search YouTube for educational videos on this topic",
                "url": f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}",
                "type": "search_link",
            }
        ]
        return suggestions

    def _search_google_articles(
        self, query: str, max_results: int = 5
    ) -> List[Dict[str, str]]:
        """
        Search for blog articles and educational content using Google Custom Search.

        Args:
            query: Search query
            max_results: Maximum number of results

        Returns:
            List of article information
        """
        try:
            google_api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
            google_cse_id = os.getenv("GOOGLE_CSE_ID")

            if google_api_key and google_cse_id:
                return self._search_google_api(
                    query, google_api_key, google_cse_id, max_results
                )
            else:
                # Fallback: return structured search suggestions
                return self._generate_google_suggestions(query, max_results)

        except Exception as e:
            print(f"Error searching Google articles: {e}")
            return []

    def _search_google_api(
        self, query: str, api_key: str, cse_id: str, max_results: int
    ) -> List[Dict[str, str]]:
        """
        Search using Google Custom Search API.

        Args:
            query: Search query
            api_key: Google API key
            cse_id: Custom Search Engine ID
            max_results: Maximum number of results

        Returns:
            List of search results
        """
        try:
            url = "https://www.googleapis.com/customsearch/v1"
            params = {"key": api_key, "cx": cse_id, "q": query, "num": max_results}

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            articles = []

            for item in data.get("items", []):
                article_info = {
                    "title": item["title"],
                    "description": (
                        item.get("snippet", "")[:300] + "..."
                        if len(item.get("snippet", "")) > 300
                        else item.get("snippet", "")
                    ),
                    "url": item["link"],
                    "source": self._extract_domain(item["link"]),
                }
                articles.append(article_info)

            return articles

        except Exception as e:
            print(f"Error with Google API search: {e}")
            return []

    def _generate_google_suggestions(
        self, query: str, max_results: int
    ) -> List[Dict[str, str]]:
        """
        Generate Google search suggestions when API is not available.

        Args:
            query: Search query
            max_results: Maximum number of suggestions

        Returns:
            List of search suggestions
        """
        suggestions = [
            {
                "title": f"Search Google for: {query}",
                "description": "Click to search Google for articles and guides on this topic",
                "url": f"https://www.google.com/search?q={query.replace(' ', '+')}",
                "source": "Google Search",
                "type": "search_link",
            }
        ]
        return suggestions

    def _extract_domain(self, url: str) -> str:
        """
        Extract domain name from URL.

        Args:
            url: Full URL

        Returns:
            Domain name
        """
        try:
            import re

            domain_match = re.search(r"https?://(?:www\.)?([^/]+)", url)
            return domain_match.group(1) if domain_match else "Unknown"
        except Exception:
            return "Unknown"
