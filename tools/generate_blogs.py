from pathlib import Path
from zipfile import ZipFile
import html
import shutil
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\Darshan\Downloads\blog cp")
BLOG_DIR = ROOT / "blogs"
IMAGE_DIR = ROOT / "assets" / "images" / "blog"
NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}

SLUGS = [
    "early-signs-of-cerebral-palsy",
    "how-physiotherapy-helps-children-with-cp",
    "daily-care-tips-for-parents",
    "understanding-autism-and-developmental-delays",
    "best-home-exercises-for-children-with-cp",
    "government-schemes-for-children-with-disabilities-india",
]

CATEGORIES = [
    "Early Awareness",
    "Therapy Guide",
    "Parent Care",
    "Development Guide",
    "Home Therapy",
    "Government Support",
]

HEADINGS = {
    "What Is Cerebral Palsy?",
    "Early Signs of Cerebral Palsy in Babies and Toddlers",
    "Is Every Delay a Sign of CP?",
    "When to Consult a Doctor",
    "Why Early Intervention Matters",
    "What Parents Can Do Today",
    "From Our Journey to Every Family's Hope",
    "What Is Physiotherapy for Cerebral Palsy?",
    "How Physiotherapy Helps Children with CP",
    "Why Start Early?",
    "How Often Does a Child Need Physiotherapy?",
    "Making Physiotherapy Work at Home",
    "What Parents Can Do Today",
    "When to Seek Professional Help",
    "Build a Predictable Daily Routine",
    "Make Mealtimes Safe and Comfortable",
    "Handle and Position with Care",
    "Encourage Independence Step by Step",
    "Communicate in Every Way",
    "Turn Daily Tasks into Play",
    "Care for the Caregiver Too",
    "What Is a Developmental Delay?",
    "What Is Autism?",
    "Autism vs Developmental Delay: What's the Difference?",
    "Early Signs of Autism and Developmental Delay",
    "When Should You See a Doctor?",
    "How Early Support Helps",
    "What Families Can Do",
    "Are Home Exercises Safe for Children with CP?",
    "Simple Home Activities Therapists Often Use",
    "Make Exercise Feel Like Play",
    "How Often Should Children Practise?",
    "When to Stop and Seek Advice",
    "Involve the Whole Family",
    "Start with a Disability Certificate and UDID",
    "Key Schemes for Children with Cerebral Palsy",
    "Other Support Worth Asking About",
    "How to Apply Step by Step",
    "Why This Matters",
}

LIST_INTROS = {
    "Signs vary and often become clearer over the first two years. Watch for:",
    "Depending on individual needs, physiotherapy may help to:",
    "Making Physiotherapy Work at Home",
    "Consider a professional assessment if your child:",
    "What Families Can Do",
    "Depending on your child's age and abilities, a therapist may suggest activities such as:",
    "Stop the activity and contact your doctor or therapist if your child shows:",
    "Key Schemes for Children with Cerebral Palsy",
    "Other Support Worth Asking About",
    "How to Apply Step by Step",
}


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def read_docx(path: Path) -> list[str]:
    with ZipFile(path) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))

    lines = []
    for paragraph in document.findall(".//w:body/w:p", NS):
        text = "".join(
            node.text or "" for node in paragraph.findall(".//w:t", NS)
        ).strip()
        if text:
            lines.append(text)
    return lines


def article_html(lines: list[str]) -> str:
    output = []
    in_list = False
    ordered = False

    for index, line in enumerate(lines[1:], start=1):
        next_line = lines[index + 1] if index + 1 < len(lines) else ""

        if line in HEADINGS:
            if in_list:
                output.append("</ol>" if ordered else "</ul>")
                in_list = False
                ordered = False
            output.append(f"<h2>{esc(line)}</h2>")
            if line in LIST_INTROS:
                ordered = line == "How to Apply Step by Step"
                output.append("<ol>" if ordered else "<ul>")
                in_list = True
            continue

        starts_list = (
            line in LIST_INTROS
            or line.endswith("Watch for:")
            or line.endswith("may help to:")
            or line.endswith("if your child:")
            or line.endswith("such as:")
            or line.endswith("if your child shows:")
        )
        if starts_list:
            output.append(f"<p>{esc(line)}</p>")
            output.append("<ul>")
            in_list = True
            continue

        if in_list:
            output.append(f"<li>{esc(line)}</li>")
            if (
                next_line in HEADINGS
                or line.startswith("One sign")
                or line.startswith("Progress varies")
                or line.startswith("Never push")
                or line.startswith("UDID applications")
            ):
                output.append("</ol>" if ordered else "</ul>")
                in_list = False
                ordered = False
            continue

        output.append(f"<p>{esc(line)}</p>")

    if in_list:
        output.append("</ol>" if ordered else "</ul>")

    return "\n".join(output)


def page_header(title: str, description: str, prefix: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="icon" href="{prefix}favicon.ico" sizes="any" />
  <link rel="stylesheet" href="{prefix}css/styles.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <div class="container header-inner">
      <a class="brand" href="{prefix}index.html" aria-label="Jwalin Charitable Trust home"><img class="brand-logo" src="{prefix}assets/images/logo.png" alt="Jwalin Charitable Trust logo" /><span class="brand-text"><span class="brand-name">Jwalin</span><span class="brand-sub">Charitable Trust</span></span></a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu"><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span></button>
      <nav class="primary-nav" id="primary-nav" aria-label="Primary">
        <ul class="nav-list">
          <li><a href="{prefix}about.html">About Us</a></li>
          <li><a href="{prefix}cerebral-palsy.html">Cerebral Palsy</a></li>
          <li><a href="{prefix}treatments.html">Therapies</a></li>
          <li><a href="{prefix}parent-support.html">Parent Support</a></li>
          <li class="has-dropdown"><button class="dropdown-toggle" aria-expanded="false" aria-haspopup="true">More</button>
            <ul class="dropdown">
              <li><a href="{prefix}mental-disorders.html">Mental Disorders</a></li>
              <li><a href="{prefix}diagnosis.html">Diagnosis &amp; Assessment</a></li>
              <li><a href="{prefix}our-contribution.html">Our Contribution</a></li>
              <li><a href="{prefix}success-stories.html">Success Stories</a></li>
              <li><a href="{prefix}gallery.html">Gallery</a></li>
              <li><a href="{prefix}blog.html" class="active" aria-current="page">Blog &amp; Resources</a></li>
              <li><a href="{prefix}volunteer.html">Volunteer</a></li>
            </ul>
          </li>
          <li><a href="{prefix}contact.html">Contact</a></li>
          <li class="nav-cta"><a class="btn btn-primary btn-sm" href="{prefix}donate.html">Donate</a></li>
        </ul>
      </nav>
    </div>
  </header>"""


def page_footer(prefix: str) -> str:
    return f"""
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="{prefix}index.html" aria-label="Jwalin Charitable Trust home"><img class="brand-logo footer-logo" src="{prefix}assets/images/logo.png" alt="Jwalin Charitable Trust logo" /></a>
          <p class="footer-tagline">"From Our Journey to Every Family's Hope"</p>
          <p>Supporting children with Cerebral Palsy and developmental disorders through awareness, therapy, education and compassionate family care.</p>
        </div>
        <div class="footer-col"><h4>Explore</h4><ul><li><a href="{prefix}about.html">About Us</a></li><li><a href="{prefix}cerebral-palsy.html">Cerebral Palsy</a></li><li><a href="{prefix}treatments.html">Therapies</a></li><li><a href="{prefix}parent-support.html">Parent Support</a></li></ul></div>
        <div class="footer-col"><h4>Get involved</h4><ul><li><a href="{prefix}donate.html">Donate</a></li><li><a href="{prefix}volunteer.html">Volunteer</a></li><li><a href="{prefix}our-contribution.html">Our Contribution</a></li><li><a href="{prefix}gallery.html">Gallery</a></li></ul></div>
        <div class="footer-col"><h4>Contact</h4><ul><li><a href="tel:+919558812094">Helpline: +91 9558812094</a></li><li><a href="mailto:info@cpchildindia.org">info@cpchildindia.org</a></li><li><a href="{prefix}contact.html">Visit / Location</a></li><li><a href="{prefix}blog.html">Blog &amp; Resources</a></li></ul></div>
      </div>
      <div class="footer-bottom"><span>© <span id="year">2026</span> Jwalin Charitable Trust · cpchildindia.org</span><span><a href="#">Privacy Policy</a> · <a href="#">Terms &amp; Conditions</a></span></div>
    </div>
  </footer>
  <script src="{prefix}js/main.js"></script>
</body>
</html>"""


def build_posts() -> list[dict[str, str | list[str]]]:
    BLOG_DIR.mkdir(exist_ok=True)
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    posts = []

    for index, docx in enumerate(sorted(SOURCE.glob("*.docx")), start=1):
        lines = read_docx(docx)
        image = next(SOURCE.glob(f"{index}*image.png"))
        image_name = f"blog-{index}.png"
        shutil.copy2(image, IMAGE_DIR / image_name)
        posts.append(
            {
                "title": lines[0],
                "intro": lines[1],
                "lines": lines,
                "slug": SLUGS[index - 1],
                "category": CATEGORIES[index - 1],
                "image": f"assets/images/blog/{image_name}",
                "detail_image": f"../assets/images/blog/{image_name}",
            }
        )

    return posts


def write_listing(posts: list[dict[str, str | list[str]]], target: Path, prefix: str) -> None:
    cards = "\n".join(
        f"""<article class="blog-card reveal">
          <a class="blog-card-media" href="{prefix}blogs/{post['slug']}.html"><img src="{prefix}{post['image']}" alt="{esc(post['title'])}" loading="lazy" /></a>
          <div class="blog-card-body">
            <span class="blog-category">{esc(post['category'])}</span>
            <h2><a href="{prefix}blogs/{post['slug']}.html">{esc(post['title'])}</a></h2>
            <p>{esc(post['intro'])}</p>
            <a class="blog-read-more" href="{prefix}blogs/{post['slug']}.html">Read more <span aria-hidden="true">&rarr;</span></a>
          </div>
        </article>"""
        for post in posts
    )
    page = (
        page_header(
            "Blog & Resources - Guides for Parents | Jwalin Charitable Trust",
            "Helpful articles for parents about cerebral palsy, therapy, home care, autism, developmental delays and disability support schemes.",
            prefix,
        )
        + f"""
  <main id="main">
    <section class="blog-hero">
      <div class="container blog-hero-grid">
        <div>
          <p class="breadcrumb"><a href="{prefix}index.html">Home</a> / Blog &amp; Resources</p>
          <span class="eyebrow">Blog &amp; Resources</span>
          <h1>Helpful guides for every parent</h1>
          <p class="lead">Practical, compassionate articles for families caring for children with cerebral palsy and developmental differences.</p>
        </div>
      </div>
    </section>
    <section class="section blog-list-section">
      <div class="container">
        <div class="blog-grid">
          {cards}
        </div>
      </div>
    </section>
  </main>"""
        + page_footer(prefix)
    )
    target.write_text(page, encoding="utf-8")


def write_details(posts: list[dict[str, str | list[str]]]) -> None:
    for post in posts:
        body = article_html(post["lines"])
        page = (
            page_header(
                f"{esc(post['title'])} | Jwalin Charitable Trust",
                esc(post["intro"][:155]),
                "../",
            )
            + f"""
  <main id="main">
    <article class="blog-detail">
      <header class="blog-detail-hero">
        <div class="container">
          <p class="breadcrumb"><a href="../index.html">Home</a> / <a href="../blog.html">Blog</a> / {esc(post['title'])}</p>
          <a class="blog-back" href="../blog.html">&larr; Back to Blog</a>
          <span class="blog-category">{esc(post['category'])}</span>
          <h1>{esc(post['title'])}</h1>
          <p class="lead">{esc(post['intro'])}</p>
        </div>
      </header>
      <div class="container blog-article-wrap">
        <img class="blog-detail-image" src="{post['detail_image']}" alt="{esc(post['title'])}" />
        <div class="blog-content">
          {body}
        </div>
        <a class="blog-back bottom" href="../blog.html">&larr; Back to Blog</a>
      </div>
    </article>
  </main>"""
            + page_footer("../")
        )
        (BLOG_DIR / f"{post['slug']}.html").write_text(page, encoding="utf-8")


def main() -> None:
    posts = build_posts()
    write_listing(posts, ROOT / "blog.html", "")
    write_listing(posts, ROOT / "blog" / "index.html", "../")
    write_details(posts)
    print(f"Generated {len(posts)} blog posts.")


if __name__ == "__main__":
    main()

