"""
Flask backend — AI Code Explainer & Flow Visualizer
Endpoint: POST /analyze
Uses Groq API (LLaMA3-70B) to analyze code and return structured JSON.
"""

import os
import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
from dotenv import load_dotenv

# ── Load environment variables ────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)

# Allow all origins in development; restrict in production
CORS(app, resources={r"/*": {"origins": "*"}})

# ── Groq client ───────────────────────────────────────────────────────────────
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

MODEL = "llama-3.3-70b-versatile"  # Updated from decommissioned llama3-70b-8192

# ── Prompt template ───────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert software engineer and code analyst.
When given code, you analyze it thoroughly and respond ONLY with a valid JSON object (no markdown, no extra text).

The JSON must follow this exact structure:
{
  "explanation": "A clear explanation with: 1) Simple summary paragraph, 2) Line-by-line breakdown numbered 1,2,3..., 3) Example input/output",
  "flowchart": "graph TD; A[Start] --> B[Step]; B --> C[End];",
  "complexity": "Time: O(n), Space: O(1) - brief explanation of why",
  "optimized_code": "// Improved version of the code with comments explaining optimizations"
}

Rules:
- Return ONLY valid JSON. No backticks, no markdown code fences, no extra text before or after.
- For flowchart: use Mermaid.js graph TD syntax. Keep it under 20 nodes for readability.
- For complexity: always mention Time and Space complexity with Big-O notation.
- For optimized_code: if code is already optimal, return the same code with a comment saying it's optimal.
- Escape all double quotes inside strings with backslash.
- Do not include newlines inside JSON string values; use \\n instead."""

USER_PROMPT_TEMPLATE = """Analyze this {language} code and return a JSON response:

```{language}
{code}
```

Return ONLY the JSON object with keys: explanation, flowchart, complexity, optimized_code."""


def extract_json(text: str) -> dict:
    """
    Robustly extract JSON from LLM response, even if it contains
    extra text or markdown code fences.
    """
    # Remove markdown code fences if present
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()

    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object within the text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Last resort: try to fix common issues
    text = re.sub(r'(?<!\\)\n', '\\n', text)
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse JSON response: {e}\nRaw: {text[:500]}")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "model": MODEL}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Accepts { code: str, language: str } in JSON body.
    Returns { explanation, flowchart, complexity, optimized_code } JSON.
    """
    data = request.get_json(force=True, silent=True)

    if not data:
        return jsonify({"error": "Request body must be JSON."}), 400

    code = data.get("code", "").strip()
    language = data.get("language", "python").strip()

    if not code:
        return jsonify({"error": "No code provided. Please send { code: '...' }."}), 400

    if len(code) > 8000:
        return jsonify({"error": "Code is too long (max 8000 characters)."}), 400

    # Build prompt
    user_prompt = USER_PROMPT_TEMPLATE.format(
        language=language,
        code=code,
    )

    try:
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.3,        # Lower = more deterministic JSON
            max_tokens=4096,
            top_p=0.9,
        )

        raw_response = chat_completion.choices[0].message.content

        # Parse the JSON response
        result = extract_json(raw_response)

        # Ensure all required keys exist with fallbacks
        sanitized = {
            "explanation":    result.get("explanation", "No explanation generated."),
            "flowchart":      result.get("flowchart", "graph TD; A[No flowchart] --> B[Try again];"),
            "complexity":     result.get("complexity", "Complexity not determined."),
            "optimized_code": result.get("optimized_code", code),
        }

        return jsonify(sanitized), 200

    except ValueError as e:
        app.logger.error(f"JSON parse error: {e}")
        return jsonify({"error": f"AI returned invalid JSON: {str(e)[:200]}"}), 500

    except Exception as e:
        app.logger.error(f"Groq API error: {e}")

        err_str = str(e).lower()
        if "api_key" in err_str or "authentication" in err_str or "unauthorized" in err_str:
            return jsonify({"error": "Invalid or missing GROQ_API_KEY. Check your .env file."}), 500
        elif "rate_limit" in err_str or "429" in err_str:
            return jsonify({"error": "Groq API rate limit exceeded. Please wait and try again."}), 429
        else:
            return jsonify({"error": f"AI analysis failed: {str(e)[:300]}"}), 500


if __name__ == "__main__":
    if not os.environ.get("GROQ_API_KEY"):
        print("\n⚠️  WARNING: GROQ_API_KEY not found in environment variables!")
        print("   Edit backend/.env and add: GROQ_API_KEY=your_key_here\n")
    else:
        print("\n✅  GROQ_API_KEY loaded successfully.")

    print(f"🤖  Model: {MODEL}")
    print("🚀  Starting Flask backend on http://localhost:5000")
    print("📡  Endpoint: POST /analyze\n")

    app.run(host="0.0.0.0", port=5000, debug=True)
