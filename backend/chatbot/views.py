import json
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from chatbot.utils.chatbot_utils import ChatBot


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────

def _extract_user_id(request):
    """
    Soft-extract user_id from a JWT Bearer token without enforcing authentication.
    Returns None gracefully if the token is missing, expired, or invalid.
    This allows the Groq AI endpoints to work even without a valid session.
    """
    try:
        from rest_framework_simplejwt.authentication import JWTAuthentication
        jwt_auth = JWTAuthentication()
        validated = jwt_auth.authenticate(request)
        if validated:
            user, _ = validated
            return user.id
    except Exception:
        pass
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Chat endpoint (requires auth)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def chat_with_bot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        chat_id = 1
        user_id = _extract_user_id(request)

        user_message = ""
        uploaded_file = None

        if request.content_type and request.content_type.startswith("multipart/form-data"):
            user_message = request.POST.get("user_message", "").strip()
            uploaded_file = request.FILES.get("files", None)
        else:
            try:
                body = json.loads(request.body)
                user_message = body.get("user_message", "").strip()
            except (json.JSONDecodeError, AttributeError):
                user_message = ""

        if not user_message and not uploaded_file:
            return JsonResponse({"error": "user_message or file is required"}, status=400)

        bot = ChatBot(chat_id=chat_id, user_id=user_id)
        response = bot.reply(user_message=user_message, file=uploaded_file)

        extracted_user_data = None
        external_resources = None
        bot_component = None
        bot_data = None

        try:
            if isinstance(response, dict):
                if "youtube_videos" in response or "blog_articles" in response:
                    external_resources = response
                    response = response.get("message", "Here are some resources for you:")
                elif "component" in response:
                    bot_component = response.get("component")
                    bot_data = response.get("data")
                    response = response.get("bot_reply", "Here is the information you requested:")
                else:
                    extracted_user_data = response
                    response = f"I have extracted this information from your document: ```json {extracted_user_data}```"
        except Exception:
            pass

        return JsonResponse({
            "success": True,
            "chat_id": chat_id,
            "user_id": user_id,
            "extracted_user_data": extracted_user_data,
            "external_resources": external_resources,
            "bot_reply": response,
            "component": bot_component,
            "data": bot_data,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


# ─────────────────────────────────────────────────────────────────────────────
# Groq AI endpoints (open — no auth required)
# ─────────────────────────────────────────────────────────────────────────────

@api_view(["POST"])
@permission_classes([AllowAny])
def get_chart_insight(request):
    """
    Returns a plain-English AI explanation of a chart via Groq.
    Body: { "chart_type": "...", "chart_data": "..." }
    Open endpoint — no auth required. User personalisation is applied
    when a valid JWT is present in the Authorization header.
    """
    try:
        body = json.loads(request.body)
        chart_type = body.get("chart_type", "Retirement Corpus Chart")
        chart_data = body.get("chart_data", "")

        if not chart_data:
            return JsonResponse({"error": "chart_data is required"}, status=400)

        user_id = _extract_user_id(request)
        bot = ChatBot(chat_id=1, user_id=user_id)
        insight = bot.get_chart_insight(chart_type=chart_type, chart_data=chart_data)

        return JsonResponse({"success": True, "insight": insight})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def get_bucket_advisory(request):
    """
    Returns the 3-bucket investment advisory plan via Groq.
    Body: { "corpus": 10000000, "risk_profile": "Moderate", "selected_scenario": "phased" }
    Open endpoint — no auth required. User personalisation is applied
    when a valid JWT is present in the Authorization header.
    """
    try:
        body = json.loads(request.body)
        corpus = float(body.get("corpus", 0))
        risk_profile = body.get("risk_profile", "Moderate")
        selected_scenario = body.get("selected_scenario", "phased")

        if corpus <= 0:
            return JsonResponse({"error": "A valid corpus amount is required"}, status=400)

        user_id = _extract_user_id(request)
        bot = ChatBot(chat_id=1, user_id=user_id)
        advisory = bot.get_bucket_advisory(
            corpus=corpus,
            risk_profile=risk_profile,
            selected_scenario=selected_scenario,
        )

        return JsonResponse({"success": True, "advisory": advisory})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def ask_financial_question(request):
    """
    Stateless Groq-powered Q&A endpoint.
    The frontend sends ALL context on every request (scenarios, graph summary,
    recent chat history). No server-side session or memory needed — fully
    deployable on any stateless cloud platform (Railway, Render, Heroku, etc.)

    Body:
    {
      "message"       : "Which scenario gives the most monthly income?",
      "scenarios"     : [...],          // list of scenario objects from chat state
      "graph_context" : "...",          // plain-text summary of visible charts
      "chat_history"  : [...]           // last N {type, content} message objects
    }
    """
    try:
        body = json.loads(request.body)
        user_message  = body.get("message", "").strip()
        scenarios     = body.get("scenarios", [])
        graph_context = body.get("graph_context", "")
        chat_history  = body.get("chat_history", [])

        if not user_message:
            return JsonResponse({"error": "message is required"}, status=400)

        user_id = _extract_user_id(request)
        bot = ChatBot(chat_id=1, user_id=user_id)
        result = bot.get_financial_answer(
            user_message=user_message,
            scenarios=scenarios,
            graph_context=graph_context,
            chat_history=chat_history,
        )

        return JsonResponse({
            "success": True, 
            "answer": result.get("answer", ""),
            "trigger": result.get("trigger", "none"),
            "data": result.get("data", {})
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)
