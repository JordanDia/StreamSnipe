import json

# Load the original chat.json
with open("chat.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Write a formatted, indented version
with open("chat_pretty.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Formatted chat_pretty.json saved!")
