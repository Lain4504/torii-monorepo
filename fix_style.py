import re

filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/marketing/lecturer-detail-client.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'style="width:\s*(\d+)%"', r'style={{ width: "\1%" }}', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
