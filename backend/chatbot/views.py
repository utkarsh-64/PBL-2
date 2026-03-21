import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from chatbot.utils.chatbot_utils import ChatBot


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat_with_bot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        chat_id = 1
        user_id = request.user.id if request.user.is_authenticated else None

        # Extract message from form-data or JSON
        user_message = ""
        uploaded_file = None

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            user_message = request.POST.get("user_message", "").strip()
            uploaded_file = request.FILES.get("files", None)
        else:
            # JSON body
            try:
                body = json.loads(request.body)
                user_message = body.get("user_message", "").strip()
            except (json.JSONDecodeError, AttributeError):
                user_message = ""

        if not user_message and not uploaded_file:
            return JsonResponse(
                {"error": "user_message or file is required"}, status=400
            )

        # Create ChatBot instance
        bot = ChatBot(chat_id=chat_id, user_id=user_id)

        # Pass both text + file
        response = bot.reply(user_message=user_message, file=uploaded_file)

        extracted_user_data = None
        external_resources = None

        try:
            if isinstance(response, dict):
                # Check if it's extracted user data or external resources
                if "youtube_videos" in response or "blog_articles" in response:
                    external_resources = response
                    response = response.get(
                        "message", "Here are some resources for you:"
                    )
                else:
                    extracted_user_data = response
                    response = f"I have extracted these information from your document ```json {extracted_user_data}```"
        except Exception:
            pass

        return JsonResponse(
            {
                "success": True,
                "chat_id": chat_id,
                "user_id": user_id,
                "extracted_user_data": extracted_user_data,
                "external_resources": external_resources,
                "bot_reply": response,
            }
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)
