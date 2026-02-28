import os
import re

auth_dir = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/app/(auth)'

for root, dirs, files in os.walk(auth_dir):
    for f in files:
        if f.endswith('.tsx'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as file:
                content = file.read()
                
            # Regex to remove leftPanel={ ... } prop completely from <AuthLayout ...>
            # It needs to match leftPanel={...} where ... can be multi-line JSX.
            # Using a simple brace matching logic or a regular expression.
            # A Regex for `leftPanel={<...}` with nesting is hard, but we know it's inside <AuthLayout>...</AuthLayout>
            # Alternative: in AuthLayout, rename leftPanel prop to ignoredLeftPanel?
            pass

# That would be painful in regex. Let's mutate AuthLayout to accept it but ignore it, and let TS be happy without changing all pages.
layout_path = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/auth/auth-layout.tsx'
with open(layout_path, 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Replace `{leftPanel || (` with just `(` and keep the default content, but keep accepting the prop.
# Actually, I already wrote `{leftPanel || (`. I will change it to ignore leftPanel.

layout_content = layout_content.replace("{leftPanel || (", "{false && leftPanel ? null : (")

with open(layout_path, 'w', encoding='utf-8') as f:
    f.write(layout_content)

print("Updated AuthLayout")
