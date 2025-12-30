from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Course, Lesson, KeyTakeaway, Exercise, Resource


class Command(BaseCommand):
    help = "Enrich Mathematics Foundations lessons with rich content, key takeaways, exercises, and resources"

    def handle(self, *args, **options):
        try:
            course = Course.objects.get(title="Mathematics Foundations")
        except Course.DoesNotExist:
            self.stdout.write(self.style.ERROR("Math course not found. Run add_math_course first."))
            return

        lesson_data = self._lesson_payload()

        updated_lessons = 0
        created_takeaways = 0
        created_exercises = 0
        created_resources = 0

        with transaction.atomic():
            for lesson in Lesson.objects.filter(module__course=course):
                data = lesson_data.get(lesson.title)
                if not data:
                    self.stdout.write(self.style.WARNING(f"Skipping unmatched lesson: {lesson.title}"))
                    continue

                # Update lesson content
                lesson.content = data["content"]
                lesson.save(update_fields=["content"])
                updated_lessons += 1

                # Replace takeaways
                KeyTakeaway.objects.filter(lesson=lesson).delete()
                for order, takeaway in enumerate(data.get("takeaways", []), start=1):
                    KeyTakeaway.objects.create(lesson=lesson, content=takeaway, order=order)
                    created_takeaways += 1

                # Replace exercises
                Exercise.objects.filter(lesson=lesson).delete()
                for order, ex in enumerate(data.get("exercises", []), start=1):
                    Exercise.objects.create(
                        lesson=lesson,
                        title=ex["title"],
                        description=ex["description"],
                        order=order,
                    )
                    created_exercises += 1

                # Replace resources
                Resource.objects.filter(lesson=lesson).delete()
                for order, res in enumerate(data.get("resources", []), start=1):
                    Resource.objects.create(
                        lesson=lesson,
                        title=res["title"],
                        description=res.get("description", ""),
                        url=res.get("url", "https://example.com"),
                        order=order,
                    )
                    created_resources += 1

        self.stdout.write(self.style.SUCCESS("Enrichment complete."))
        self.stdout.write(f"Lessons updated: {updated_lessons}")
        self.stdout.write(f"Takeaways created: {created_takeaways}")
        self.stdout.write(f"Exercises created: {created_exercises}")
        self.stdout.write(f"Resources created: {created_resources}")

    def _lesson_payload(self):
        # Content strings use simple math notation; rich text renderer can display HTML/TeX-ish text.
        return {
            "Variables and Expressions": {
                "content": (
                    "<p>Variables stand for numbers. Combine like terms and respect order of operations (PEMDAS)."  # noqa: E501
                    "</p><p>Example: 3x + 5 - 2x = x + 5.</p><p>Distribute: a(b + c) = ab + ac."  # noqa: E501
                    "</p>"
                ),
                "takeaways": [
                    "Combine like terms and apply distributive property correctly.",
                    "Use PEMDAS to evaluate and simplify expressions.",
                    "Translate word statements into algebraic expressions.",
                ],
                "exercises": [
                    {
                        "title": "Simplify Expressions",
                        "description": "Simplify 5x - 3 + 2(4 - x) → 5x - 3 + 8 - 2x = 3x + 5.",
                    },
                    {
                        "title": "Translate Words",
                        "description": """Write algebra for: "five more than twice a number" → 2n + 5.""",
                    },
                ],
                "resources": [
                    {
                        "title": "Distributive Property Guide",
                        "description": "Examples of a(b+c)=ab+ac with integers and fractions.",
                        "url": "https://example.com/distributive",
                    },
                    {
                        "title": "PEMDAS Cheat Sheet",
                        "description": "Order of operations with worked examples.",
                        "url": "https://example.com/pemdas",
                    },
                ],
            },
            "Linear Equations": {
                "content": (
                    "<p>Solve ax + b = c by isolating x: x = (c - b)/a.</p>"
                    "<p>Example: 2x + 5 = 17 → 2x = 12 → x = 6.</p>"
                    "<p>Equation with variables both sides: 3x - 7 = 2x + 5 → x = 12.</p>"
                ),
                "takeaways": [
                    "Maintain balance: whatever you do to one side, do to the other.",
                    "Combine like terms before isolating the variable.",
                    "Check solutions by substitution back into the original equation.",
                ],
                "exercises": [
                    {
                        "title": "One-Step & Two-Step",
                        "description": "Solve 7 + 4x = 31 → 4x = 24 → x = 6; Solve -3x = 21 → x = -7.",
                    },
                    {
                        "title": "Variables Both Sides",
                        "description": "Solve 5x - 9 = 2x + 12 → 3x = 21 → x = 7.",
                    },
                ],
                "resources": [
                    {
                        "title": "Linear Equations Workbook",
                        "description": "Step-by-step practice from one-step to variables on both sides.",
                        "url": "https://example.com/linear-equations",
                    },
                    {
                        "title": "Equation Solver Demo",
                        "description": "Interactive solver showing each algebra move.",
                        "url": "https://example.com/solver",
                    },
                ],
            },
            "Linear Functions": {
                "content": (
                    "<p>Slope-intercept form: y = mx + b. Slope m = (y2 - y1)/(x2 - x1).</p>"
                    "<p>Point-slope form: y - y1 = m(x - x1). Convert between forms.</p>"
                    "<p>Example: Through (2,3) with slope 4 → y - 3 = 4(x - 2) → y = 4x - 5.</p>"
                ),
                "takeaways": [
                    "Slope measures rate of change; b is the y-intercept.",
                    "Use two points to compute slope then write the line equation.",
                    "Convert between slope-intercept and point-slope efficiently.",
                ],
                "exercises": [
                    {
                        "title": "Find Slope",
                        "description": "Points (1, -2) and (5, 6): m = (6 - (-2))/(5 - 1) = 8/4 = 2.",
                    },
                    {
                        "title": "Write the Line",
                        "description": "Through ( -3, 4 ) slope -1/2 → y - 4 = -1/2 (x + 3) → y = -0.5x + 2.5.",
                    },
                ],
                "resources": [
                    {
                        "title": "Slope & Intercept Visualizer",
                        "description": "Graphing tool to see changes in m and b.",
                        "url": "https://example.com/lines",
                    },
                    {
                        "title": "Linear Models in Context",
                        "description": "Using y=mx+b for rate problems and predictions.",
                        "url": "https://example.com/models",
                    },
                ],
            },
            "Triangles and Angles": {
                "content": (
                    "<p>Triangle interior angles sum to 180°. Exterior angle equals sum of remote interior angles.</p>"
                    "<p>Right triangle: a^2 + b^2 = c^2 (Pythagorean). Example: legs 5 and 12 → hypotenuse 13.</p>"
                ),
                "takeaways": [
                    "Use angle sum to find missing angles in triangles.",
                    "Exterior angle theorem speeds up angle finds.",
                    "Pythagorean theorem applies only to right triangles.",
                ],
                "exercises": [
                    {
                        "title": "Find Missing Angle",
                        "description": "Angles 35° and 75° → third angle = 70°.",
                    },
                    {
                        "title": "Pythagorean",
                        "description": "Legs 9 and 40 → hypotenuse = √(81+1600)= √1681 = 41.",
                    },
                ],
                "resources": [
                    {
                        "title": "Triangle Angle Rules",
                        "description": "Interior/exterior examples with diagrams.",
                        "url": "https://example.com/triangles",
                    },
                    {
                        "title": "Pythagorean Calculator",
                        "description": "Compute missing side instantly.",
                        "url": "https://example.com/pythag",
                    },
                ],
            },
            "Circles": {
                "content": (
                    "<p>Circumference: C = 2πr. Area: A = πr^2.</p>"
                    "<p>Arc length: L = (θ/360°)·2πr. Sector area: A = (θ/360°)·πr^2.</p>"
                    "<p>Example: r = 10, θ = 60° → L ≈ (60/360)*2π*10 ≈ 10.47; sector area ≈ 52.36.</p>"
                ),
                "takeaways": [
                    "Relate degrees of arc to fraction of full circle.",
                    "Use arc length and sector area formulas with radians or degrees.",
                    "Keep π symbolic when exact values are needed.",
                ],
                "exercises": [
                    {
                        "title": "Arc Length",
                        "description": "r=7, θ=45° → L = (45/360)*2π*7 = (1/8)*14π = 1.75π ≈ 5.50.",
                    },
                    {
                        "title": "Sector Area",
                        "description": "r=5, θ=120° → A = (120/360)*π*25 = (1/3)*25π ≈ 26.18.",
                    },
                ],
                "resources": [
                    {
                        "title": "Circle Formula Sheet",
                        "description": "All key circle formulas in one page.",
                        "url": "https://example.com/circles",
                    },
                    {
                        "title": "Radians vs Degrees",
                        "description": "Conversion tips and examples.",
                        "url": "https://example.com/radians",
                    },
                ],
            },
            "Area and Perimeter": {
                "content": (
                    "<p>Rectangle: A = lw, P = 2(l + w). Triangle: A = 1/2 bh.</p>"
                    "<p>Composite figures: break into simple shapes, sum areas. Perimeter follows edges.</p>"
                    "<p>Example: L-shape made of 8x4 and 4x4 rectangles → total area = 32 + 16 = 48.</p>"
                ),
                "takeaways": [
                    "Use correct formula per shape; track units squared for area.",
                    "Decompose composite shapes into rectangles/triangles.",
                    "Check perimeter by walking the outline once.",
                ],
                "exercises": [
                    {
                        "title": "Composite Area",
                        "description": "Split complex floor plan into rectangles; compute total area.",
                    },
                    {
                        "title": "Perimeter Walk",
                        "description": "Irregular polygon side lengths: add all edges carefully.",
                    },
                ],
                "resources": [
                    {
                        "title": "Area & Perimeter Library",
                        "description": "Formulas and worked examples by shape.",
                        "url": "https://example.com/area",
                    },
                    {
                        "title": "Composite Shapes Toolkit",
                        "description": "Interactive decomposer for compound shapes.",
                        "url": "https://example.com/composite",
                    },
                ],
            },
            "Right Triangle Trigonometry": {
                "content": (
                    "<p>SOH-CAH-TOA: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj.</p>"
                    "<p>Example: right triangle with opposite 5, adjacent 12 → tan θ = 5/12; hyp = 13 so sin θ = 5/13, cos θ = 12/13.</p>"
                ),
                "takeaways": [
                    "Pick the ratio using known sides; solve for missing side or angle.",
                    "Use inverse trig to find angles: θ = sin^{-1}(opp/hyp).",
                    "Check answers against triangle side lengths (hypotenuse is longest).",
                ],
                "exercises": [
                    {
                        "title": "Find an Angle",
                        "description": "Opp=7, Hyp=25 → sin θ = 7/25 → θ ≈ 16.26°.",
                    },
                    {
                        "title": "Find a Side",
                        "description": "θ=35°, adj=10 → opp = adj·tan θ ≈ 10·0.700 = 7.0.",
                    },
                ],
                "resources": [
                    {
                        "title": "SOH-CAH-TOA Poster",
                        "description": "Mnemonic with diagrams and sample problems.",
                        "url": "https://example.com/trig",
                    },
                    {
                        "title": "Trig Calculator",
                        "description": "Compute sides/angles given partial data.",
                        "url": "https://example.com/trig-calc",
                    },
                ],
            },
            "Unit Circle": {
                "content": (
                    "<p>Radians: π rad = 180°. Unit circle gives exact values: sin(π/6)=1/2, cos(π/6)=√3/2.</p>"
                    "<p>Quadrants define signs: QI (+,+), QII (-,+), QIII (-,-), QIV (+,-).</p>"
                ),
                "takeaways": [
                    "Convert degrees ↔ radians: deg · π/180 = rad.",
                    "Memorize common angles: 0, π/6, π/4, π/3, π/2, …",
                    "Use reference angles to get sine/cosine signs quickly.",
                ],
                "exercises": [
                    {
                        "title": "Convert & Evaluate",
                        "description": "45° = π/4; sin(π/4)=√2/2, cos(π/4)=√2/2.",
                    },
                    {
                        "title": "Reference Angle",
                        "description": "Find sin(210°): ref = 30°, QIII → sin = -1/2.",
                    },
                ],
                "resources": [
                    {
                        "title": "Unit Circle Chart",
                        "description": "Printable exact values table.",
                        "url": "https://example.com/unit-circle",
                    },
                    {
                        "title": "Radians Crash Course",
                        "description": "Video on why radians matter.",
                        "url": "https://example.com/radians-video",
                    },
                ],
            },
            "Trig Identities": {
                "content": (
                    "<p>Pythagorean: sin^2 θ + cos^2 θ = 1.</p>"
                    "<p>Angle sum: sin(a±b)=sin a cos b ± cos a sin b; cos(a±b)=cos a cos b ∓ sin a sin b.</p>"
                    "<p>Example: cos(75°)=cos(45+30)=cos45 cos30 - sin45 sin30 = (√2/2)(√3/2) - (√2/2)(1/2).</p>"
                ),
                "takeaways": [
                    "Start with Pythagorean identities to rewrite expressions.",
                    "Use angle-sum/difference to get exact values for uncommon angles.",
                    "Factor and simplify using identities before plugging numbers.",
                ],
                "exercises": [
                    {
                        "title": "Rewrite Using Pythagorean",
                        "description": "Express sin^2 θ in terms of cos θ: sin^2 θ = 1 - cos^2 θ.",
                    },
                    {
                        "title": "Compute Exact Value",
                        "description": "Find sin(15°)=sin(45-30)=sin45 cos30 - cos45 sin30 = √6/4 - √2/4.",
                    },
                ],
                "resources": [
                    {
                        "title": "Identity Table",
                        "description": "Common trig identities in one place.",
                        "url": "https://example.com/trig-identities",
                    },
                    {
                        "title": "Angle Sum Practice",
                        "description": "Step-by-step angle sum/difference problems.",
                        "url": "https://example.com/angle-sum",
                    },
                ],
            },
            "Limits and Continuity": {
                "content": (
                    "<p>Limit laws: lim (f+g)=lim f + lim g; lim (f·g)= (lim f)(lim g).</p>"
                    "<p>Factoring helps: lim_{x→2} (x^2-4)/(x-2) = lim_{x→2} ((x-2)(x+2))/(x-2) = 4.</p>"
                    "<p>Continuity: function is continuous if left limit = right limit = value.</p>"
                ),
                "takeaways": [
                    "Apply limit laws and simplify before substituting.",
                    "Factor removable discontinuities to evaluate limits.",
                    "Check continuity by comparing limits to function value.",
                ],
                "exercises": [
                    {
                        "title": "Evaluate a Limit",
                        "description": "lim_{x→3} (x^2 - 9)/(x-3) = lim (x+3) = 6.",
                    },
                    {
                        "title": "Continuity Check",
                        "description": "Piecewise f(x)=x^2 for x<1, 2x for x≥1 → continuous at x=1? Left=1, Right=2 → not continuous.",
                    },
                ],
                "resources": [
                    {
                        "title": "Limit Laws Sheet",
                        "description": "Printable reference of limit properties.",
                        "url": "https://example.com/limits",
                    },
                    {
                        "title": "Continuity Examples",
                        "description": "Graphical and algebraic continuity cases.",
                        "url": "https://example.com/continuity",
                    },
                ],
            },
            "Derivatives": {
                "content": (
                    "<p>Definition: f'(x) = lim_{h→0} (f(x+h) - f(x))/h.</p>"
                    "<p>Power rule: d/dx (x^n) = n x^{n-1}. Product rule: (uv)' = u'v + uv'. Quotient: (u/v)' = (u'v - uv')/v^2.</p>"
                    "<p>Chain rule: (f(g(x)))' = f'(g(x))·g'(x).</p>"
                ),
                "takeaways": [
                    "Use power, product, quotient, and chain rules appropriately.",
                    "Rewrite roots and fractions as powers before differentiating.",
                    "Check units/slopes interpretation where applicable.",
                ],
                "exercises": [
                    {
                        "title": "Power & Product",
                        "description": "d/dx (x^3) = 3x^2; d/dx (x^2·sin x) = 2x sin x + x^2 cos x.",
                    },
                    {
                        "title": "Chain Rule",
                        "description": "d/dx ( (3x+1)^4 ) = 4(3x+1)^3 · 3 = 12(3x+1)^3.",
                    },
                ],
                "resources": [
                    {
                        "title": "Derivative Rules",
                        "description": "Compact list of differentiation rules.",
                        "url": "https://example.com/derivatives",
                    },
                    {
                        "title": "Chain Rule Visual",
                        "description": "Interactive nested-function derivative explorer.",
                        "url": "https://example.com/chain",
                    },
                ],
            },
            "Integrals": {
                "content": (
                    "<p>Indefinite: ∫ x^n dx = x^{n+1}/(n+1) + C (n≠-1). Definite integrals give area.</p>"
                    "<p>Example: ∫_0^2 (3x^2 - 4) dx = [x^3 - 4x]_0^2 = 8 - 8 = 0.</p>"
                    "<p>u-substitution: let u=g(x); ∫ f(g(x))g'(x) dx = ∫ f(u) du.</p>"
                ),
                "takeaways": [
                    "Antiderivative reverses differentiation.",
                    "Use u-substitution to simplify composite functions.",
                    "For definite integrals, change bounds when substituting u.",
                ],
                "exercises": [
                    {
                        "title": "Power Antiderivative",
                        "description": "∫ (5x^4) dx = x^5 + C; ∫ 1/x dx = ln|x| + C.",
                    },
                    {
                        "title": "u-Substitution",
                        "description": "∫ 2x·cos(x^2) dx: let u = x^2, du = 2x dx → ∫ cos u du = sin u + C = sin(x^2)+C.",
                    },
                ],
                "resources": [
                    {
                        "title": "Integral Table",
                        "description": "Common antiderivatives in one reference.",
                        "url": "https://example.com/integrals",
                    },
                    {
                        "title": "Area Under Curve",
                        "description": "Visual demo of definite integrals as area.",
                        "url": "https://example.com/area-curve",
                    },
                ],
            },
            "Descriptive Statistics": {
                "content": (
                    "<p>Mean: \bar{x} = (Σx)/n. Median: middle value. Mode: most frequent.</p>"
                    "<p>Variance: σ^2 = Σ(x-μ)^2 / n; sample variance uses n-1. Standard deviation σ = √variance.</p>"
                ),
                "takeaways": [
                    "Mean is sensitive to outliers; median is robust.",
                    "Variance/SD measure spread around the mean.",
                    "Use n-1 for sample variance (unbiased estimator).",
                ],
                "exercises": [
                    {
                        "title": "Compute Center",
                        "description": "Data: 2, 4, 4, 5, 9 → mean = 4.8, median = 4, mode = 4.",
                    },
                    {
                        "title": "Compute Spread",
                        "description": "Same data: variance = 5.36, SD ≈ 2.315 (population formulas).",
                    },
                ],
                "resources": [
                    {
                        "title": "Stats Formula Card",
                        "description": "Center and spread formulas summarized.",
                        "url": "https://example.com/stats",
                    },
                    {
                        "title": "Boxplot Guide",
                        "description": "Visualizing medians, quartiles, and outliers.",
                        "url": "https://example.com/boxplot",
                    },
                ],
            },
            "Probability Basics": {
                "content": (
                    "<p>P(A) = favorable / total. Complement: P(A^c) = 1 - P(A).</p>"
                    "<p>Multiplication with independence: P(A∩B)=P(A)P(B). Conditional: P(A∩B)=P(A)P(B|A).</p>"
                ),
                "takeaways": [
                    "Start with complement when it is simpler.",
                    "Use conditional probability for dependent events.",
                    "Check if events are independent before multiplying raw probabilities.",
                ],
                "exercises": [
                    {
                        "title": "Deck Probability",
                        "description": "P(draw ace) = 4/52 = 1/13. P(ace then king without replacement)= (4/52)*(4/51).",
                    },
                    {
                        "title": "Conditional",
                        "description": "Bag 3 red, 2 blue: P(second red | first red) = 2/4 = 1/2.",
                    },
                ],
                "resources": [
                    {
                        "title": "Probability Rules",
                        "description": "Add/multiply/complement with examples.",
                        "url": "https://example.com/probability",
                    },
                    {
                        "title": "Tree Diagrams",
                        "description": "Visualizing conditional events.",
                        "url": "https://example.com/tree",
                    },
                ],
            },
            "Discrete Distributions": {
                "content": (
                    "<p>Binomial: P(X=k)=C(n,k)p^k(1-p)^{n-k}, mean=np, var=np(1-p).</p>"
                    "<p>Geometric: P(X=k)=(1-p)^{k-1}p, mean=1/p.</p>"
                ),
                "takeaways": [
                    "Identify binomial conditions: fixed n, independent, two outcomes, same p.",
                    "Geometric models trials until first success.",
                    "Use mean/variance formulas for quick expectations.",
                ],
                "exercises": [
                    {
                        "title": "Binomial Calc",
                        "description": "n=10, p=0.3, k=4 → P = C(10,4)(0.3)^4(0.7)^6 ≈ 0.200.",
                    },
                    {
                        "title": "Geometric Mean",
                        "description": "p=0.2 → expected trials = 1/0.2 = 5.",
                    },
                ],
                "resources": [
                    {
                        "title": "Binomial Solver",
                        "description": "Compute probabilities and cumulative values.",
                        "url": "https://example.com/binomial",
                    },
                    {
                        "title": "Geometric Intuition",
                        "description": "Real-life examples of geometric waiting times.",
                        "url": "https://example.com/geometric",
                    },
                ],
            },
            "Normal Distribution": {
                "content": (
                    "<p>Bell curve with mean μ, SD σ. Z-score: z = (x - μ)/σ.</p>"
                    "<p>Empirical rule: 68%-95%-99.7% within 1,2,3 SDs.</p>"
                    "<p>Use z-tables to find tail probabilities.</p>"
                ),
                "takeaways": [
                    "Standardize with z-scores to compare different scales.",
                    "Empirical rule gives quick probability approximations.",
                    "Symmetry: P(Z>z) = P(Z<-z).",
                ],
                "exercises": [
                    {
                        "title": "Z-Score Compute",
                        "description": "x=190, μ=170, σ=15 → z = (190-170)/15 ≈ 1.33.",
                    },
                    {
                        "title": "Empirical Rule",
                        "description": "Within 2σ ≈ 95% of data for normal distributions.",
                    },
                ],
                "resources": [
                    {
                        "title": "Z-Table Online",
                        "description": "Lookup tail probabilities quickly.",
                        "url": "https://example.com/ztable",
                    },
                    {
                        "title": "Normal Curve Explorer",
                        "description": "Interactive μ/σ adjustments with shaded areas.",
                        "url": "https://example.com/normal",
                    },
                ],
            },
        }
