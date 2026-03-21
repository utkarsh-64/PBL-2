import re
import json


def extract_json_from_text(text):
    code_block_pattern = r"```(?:json)?(.*?)```"
    code_blocks = re.findall(code_block_pattern, text, re.DOTALL)

    if code_blocks:
        for block in code_blocks:
            try:
                return json.loads(block.strip())
            except json.JSONDecodeError:
                continue

    try:
        start_idx = text.find("{")
        end_idx = text.rfind("}")

        if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
            potential_json = text[start_idx : end_idx + 1]
            return json.loads(potential_json)
    except json.JSONDecodeError:
        pass
