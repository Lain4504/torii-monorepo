import re
import os

filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/analytics/analytics-dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# find all lucide instances
# Example: <i className="w-4 h-4 mr-2" data-lucide="download"></i>
def replace_lucide(match):
    attrs = match.group(1)
    icon_name = match.group(2)
    # kebab-case to PascalCase
    component_name = ''.join(word.capitalize() for word in icon_name.split('-'))
    # Extract className only
    class_match = re.search(r'className="([^"]+)"', attrs)
    class_attr = f' className="{class_match.group(1)}"' if class_match else ''
    return f'<{component_name}{class_attr} />'

# Get all unique lucide icon names to add import statement
icons = set(re.findall(r'data-lucide="([^"]+)"', content))
if not icons:
    print("No Lucide icons found")
    exit(0)

component_names = [''.join(word.capitalize() for word in name.split('-')) for name in icons]

# Replace the <i> tags
content = re.sub(r'<i([^>]+?)data-lucide="([^"]+)"[^>]*>.*?</i>', replace_lucide, content)

# Add the import statement to the top right after "use client";
import_stmt = f"import {{ {', '.join(component_names)} }} from 'lucide-react';\n"
content = content.replace("'use client';\n", f"'use client';\n\n{import_stmt}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Icons fixed")
