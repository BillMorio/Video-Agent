import re

file_path = r'c:\Users\USER\Desktop\desktop\test\lumina-video-agent\video-editor\app\playground\orchestration\[projectId]\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the pattern: </button> followed by whitespace and )}
# Add </> between them
pattern = r'(</button>\r?\n)(\s+)(\)\})'
replacement = r'\1\2  </>\r\n\2\3'

new_content = re.sub(pattern, replacement, content, count=1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Fixed: Added closing fragment tag </>')
