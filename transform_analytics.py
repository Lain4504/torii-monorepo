import re

def process_file():
    filepath = 'e:/projectdev/demo/team-source/torii-monorepo/apps/web-learner/components/analytics/analytics-dashboard.tsx'
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
    
    # SVG inline styles or other styles
    # body_content = re.sub(r'style="([^"]*)"', r'style={{\1}}', body_content)
    # Be careful with styles! Let's manually convert style="--progress-width: 68%"
    body_content = re.sub(r'style="([^"]*)"', lambda m: 'style={{ ' + ', '.join([f"'{k.strip()}': '{v.strip()}'" for k,v in [pair.split(':') for pair in m.group(1).split(';') if pair.strip()]]) + ' }}', body_content)

    
    # Fix unclosed or badly closed tags
    body_content = re.sub(r'<img(.*?)(?<!/)>', r'<img\1/>', body_content)
    body_content = re.sub(r'<input(.*?)(?<!/)>', r'<input\1/>', body_content)
    body_content = re.sub(r'<br(.*?)(?<!/)>', r'<br\1/>', body_content)
    body_content = re.sub(r'<hr(.*?)(?<!/)>', r'<hr\1/>', body_content)
    
    # SVG Paths and Circles and lines
    body_content = re.sub(r'<circle(.*?)(?<!/)>', r'<circle\1/>', body_content)
    body_content = body_content.replace('</circle>', '')
    body_content = re.sub(r'<path(.*?)(?<!/)>', r'<path\1/>', body_content)
    body_content = body_content.replace('</path>', '')
    body_content = re.sub(r'<line(.*?)(?<!/)>', r'<line\1/>', body_content)
    body_content = body_content.replace('</line>', '')
    body_content = re.sub(r'<stop(.*?)(?<!/)>', r'<stop\1/>', body_content)
    body_content = body_content.replace('</stop>', '')
    
    # `<lineargradient>` to `<linearGradient>`
    body_content = body_content.replace('<lineargradient', '<linearGradient')
    body_content = body_content.replace('</lineargradient>', '</linearGradient>')

    # Convert `<i class="..." data-lucide="..."></i>` to Lucide React components
    # We will first try to just keep them as <i> tags, but data attributes are fine in React.
    body_content = body_content.replace('data-lucide', 'data-lucide') # Nothing to change, usually valid

    # We need to define AnalyticsDashboard component
    template = f"""'use client';

export function AnalyticsDashboard() {{
  return (
    <div className="bg-background text-foreground min-h-screen font-sans antialiased">
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
