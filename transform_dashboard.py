import re

def process_file():
    filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/app/(dashboard)/dashboard/page.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract body content. The body class is "bg-slate-50 text-slate-900 font-sans antialiased"
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.IGNORECASE | re.DOTALL)
    if not body_match:
        print("Body not found")
        return
        
    body_content = body_match.group(1)
    
    # Extract style block
    style_matches = re.findall(r'<style[^>]*>(.*?)</style>', content, re.IGNORECASE | re.DOTALL)
    style_content = "\n".join(style_matches)

    # Replace HTML comments
    body_content = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body_content)
    
    # Common JSX replacements
    body_content = body_content.replace('class=', 'className=')
    body_content = body_content.replace('stroke-linecap', 'strokeLinecap')
    body_content = body_content.replace('stroke-linejoin', 'strokeLinejoin')
    body_content = body_content.replace('stroke-width', 'strokeWidth')
    body_content = body_content.replace('stroke-dasharray', 'strokeDasharray')
    body_content = body_content.replace('stroke-dashoffset', 'strokeDashoffset')
    body_content = body_content.replace('clip-rule', 'clipRule')
    body_content = body_content.replace('fill-rule', 'fillRule')
    body_content = body_content.replace('viewbox', 'viewBox')
    
    # Fix unclosed or badly closed tags
    body_content = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body_content)
    body_content = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body_content)
    body_content = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body_content)
    body_content = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body_content)
    
    # SVG Paths and Circles
    body_content = re.sub(r'<circle(.*?)(?<!/)>', r'<circle\1/>', body_content)
    body_content = body_content.replace('</circle>', '')
    body_content = re.sub(r'<path(.*?)(?<!/)>', r'<path\1/>', body_content)
    body_content = body_content.replace('</path>', '')

    # Map tailwind custom colors explicitly
    color_red = "oklch(0.55_0.15_15)"
    color_red_light = "oklch(0.65_0.12_15)"
    color_red_dark = "oklch(0.45_0.18_15)"
    
    # from Tailwind config: jp-red, jp-red-light, jp-red-dark
    body_content = body_content.replace('bg-jp-red/10', f'bg-[{color_red}/0.1]')
    body_content = body_content.replace('bg-jp-red-dark', f'bg-[{color_red_dark}]')
    body_content = body_content.replace('bg-jp-red-light', f'bg-[{color_red_light}]')
    body_content = body_content.replace('bg-jp-red', f'bg-[{color_red}]')
    
    body_content = body_content.replace('text-jp-red-light', f'text-[{color_red_light}]')
    body_content = body_content.replace('text-jp-red-dark', f'text-[{color_red_dark}]')
    body_content = body_content.replace('text-jp-red', f'text-[{color_red}]')
    
    body_content = body_content.replace('border-jp-red-light', f'border-[{color_red_light}]')
    body_content = body_content.replace('border-jp-red-dark', f'border-[{color_red_dark}]')
    body_content = body_content.replace('border-jp-red', f'border-[{color_red}]')

    body_content = body_content.replace('shadow-jp-red/30', f'shadow-[{color_red}/0.3]')
    body_content = body_content.replace('shadow-jp-red/20', f'shadow-[{color_red}/0.2]')
    body_content = body_content.replace('shadow-jp-red', f'shadow-[{color_red}]')
    
    body_content = body_content.replace('hover:bg-jp-red-light', f'hover:bg-[{color_red_light}]')
    body_content = body_content.replace('hover:bg-jp-red-dark', f'hover:bg-[{color_red_dark}]')
    
    body_content = body_content.replace('from-jp-red', f'from-[{color_red}]')
    body_content = body_content.replace('to-jp-red-dark', f'to-[{color_red_dark}]')
    
    # We may need to fix the JSX inside MainContainer because there's a sidebar that they don't want removed
    # Wait, the summary "Update Dashboard UI" in KI says "remove the sidebar from the new UI as it is redundant with the existing layout sidebar."
    # Wait, looking at the conversation summaries:
    # "The user also requested to remove the sidebar from the new UI as it is redundant with the existing layout sidebar."
    # BUT wait, the current page.tsx has:
    # <!-- BEGIN: Sidebar -->
    # <aside class="space-y-8">
    # Wait, the prompt says "E:\projectdev\demo\team-source\torii-monorepo\apps\web-learner\app\(dashboard)\dashboard\page.tsx bây giờ thực hiện chuyển đổi cho trang này cho tôi".
    # It does not mention removing the sidebar RIGHT NOW. It says "converhtml thành trang react"
    # Actually, in the summary for `Conversation 920337b2-d050-481b-9936-ab9bc04b92bc: Update Dashboard UI` it mentions "remove the sidebar from the new UI as it is redundant with the existing layout sidebar". If that was in the past, maybe I should ask or maybe it was already done there?
    # No, this is my current context! I'll leave the sidebar as is unless requested to remove, or I can remove the root navigation sidebar if it exists. The `aside` in this HTML is a *right sidebar* containing "AI Sensei CTA", "Gamification Card", and "Quick Links Grid", NOT the main app navigation sidebar. The main root layout usually has the app navigation sidebar. So this right aside is probably fine to keep.
    
    template = f"""'use client';

export default function DashboardClientPage() {{
  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
      <style>{{`
{style_content}
      `}}</style>
{body_content}
    </div>
  );
}}
"""

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(template)
    print("Done")

if __name__ == '__main__':
    process_file()
