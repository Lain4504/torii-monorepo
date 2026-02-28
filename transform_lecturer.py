import re

def process_file():
    filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/marketing/lecturer-detail-client.tsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.IGNORECASE | re.DOTALL)
    if not body_match:
        print("Body not found")
        return
        
    body_content = body_match.group(1)
    
    # Remove script tags in the body
    body_content = re.sub(r'<script[^>]*>.*?</script>', '', body_content, flags=re.IGNORECASE | re.DOTALL)

    # Extract style blocks
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
    body_content = body_content.replace('preserveaspectratio', 'preserveAspectRatio')
    body_content = body_content.replace('stop-color', 'stopColor')
    body_content = body_content.replace('stop-opacity', 'stopOpacity')
    body_content = body_content.replace('for=', 'htmlFor=')
    
    # Fix unclosed or badly closed tags
    body_content = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body_content)
    body_content = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body_content)
    body_content = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body_content)
    body_content = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body_content)
    
    # SVG Paths and Circles and lines
    body_content = re.sub(r'<circle(.*?)(?<!/)>', r'<circle\1/>', body_content)
    body_content = body_content.replace('</circle>', '')
    body_content = re.sub(r'<rect(.*?)(?<!/)>', r'<rect\1/>', body_content)
    body_content = body_content.replace('</rect>', '')
    body_content = re.sub(r'<path(.*?)(?<!/)>', r'<path\1/>', body_content)
    body_content = body_content.replace('</path>', '')
    body_content = re.sub(r'<line(.*?)(?<!/)>', r'<line\1/>', body_content)
    body_content = body_content.replace('</line>', '')
    body_content = re.sub(r'<polyline(.*?)(?<!/)>', r'<polyline\1/>', body_content)
    body_content = body_content.replace('</polyline>', '')
    body_content = re.sub(r'<stop(.*?)(?<!/)>', r'<stop\1/>', body_content)
    body_content = body_content.replace('</stop>', '')
    
    # Custom values replacing according to tailwind variables
    color_primary = "oklch(0.55_0.15_15)"
    color_primary_foreground = "#ffffff"
    color_background = "oklch(1_0_0)"
    color_foreground = "oklch(0.15_0.02_15)"
    color_muted = "oklch(0.95_0.01_15)"
    color_muted_foreground = "oklch(0.45_0.02_15)"
    color_border = "oklch(0.9_0.02_15)"
    color_card = "oklch(1_0_0)"
    color_card_foreground = "oklch(0.15_0.02_15)"
    color_accent = "oklch(0.95_0.05_15)"
    
    body_content = body_content.replace('bg-primary/5', f'bg-[{color_primary}/0.05]')
    body_content = body_content.replace('bg-primary/10', f'bg-[{color_primary}/0.1]')
    body_content = body_content.replace('bg-primary/20', f'bg-[{color_primary}/0.2]')
    body_content = body_content.replace('bg-primary/25', f'bg-[{color_primary}/0.25]')
    body_content = body_content.replace('bg-primary', f'bg-[{color_primary}]')
    body_content = body_content.replace('bg-background', f'bg-[{color_background}]')
    body_content = body_content.replace('bg-muted', f'bg-[{color_muted}]')
    body_content = body_content.replace('bg-card', f'bg-[{color_card}]')
    
    body_content = body_content.replace('text-primary/80', f'text-[{color_primary}/0.8]')
    body_content = body_content.replace('text-primary', f'text-[{color_primary}]')
    body_content = body_content.replace('text-foreground', f'text-[{color_foreground}]')
    body_content = body_content.replace('text-muted-foreground', f'text-[{color_muted_foreground}]')
    body_content = body_content.replace('text-card-foreground', f'text-[{color_card_foreground}]')
    
    body_content = body_content.replace('border-primary/20', f'border-[{color_primary}/0.2]')
    body_content = body_content.replace('border-border', f'border-[{color_border}]')
    
    body_content = body_content.replace('ring-primary/20', f'ring-[{color_primary}/0.2]')
    
    body_content = body_content.replace('shadow-primary/25', f'shadow-[{color_primary}/0.25]')
    
    body_content = body_content.replace('hover:bg-primary/5', f'hover:bg-[{color_primary}/0.05]')
    body_content = body_content.replace('hover:bg-primary/10', f'hover:bg-[{color_primary}/0.1]')
    body_content = body_content.replace('hover:text-primary', f'hover:text-[{color_primary}]')
    
    body_content = body_content.replace('from-primary/10', f'from-[{color_primary}/0.1]')
    body_content = body_content.replace('via-background', f'via-[{color_background}]')
    body_content = body_content.replace('to-background', f'to-[{color_background}]')
    
    body_content = body_content.replace('group-hover:text-primary', f'group-hover:text-[{color_primary}]')
    
    # We need to define LecturerDetailClient component
    template = f"""'use client';

export function LecturerDetailClient({{ id }}: {{ id: string }}) {{
  return (
    <div className="bg-[{color_background}] text-[{color_foreground}] antialiased min-h-screen">
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
