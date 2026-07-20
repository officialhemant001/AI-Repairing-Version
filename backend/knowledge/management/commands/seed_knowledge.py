"""
Management command to seed the database with repair knowledge articles
and generate their vector embeddings for the RAG retriever.
"""
from django.core.management.base import BaseCommand
from devices.models import DeviceCategory
from knowledge.models import KnowledgeArticle, KnowledgeEmbedding
from ai_engine.rag.embeddings import generate_embedding

KNOWLEDGE_ARTICLES = [
    {
        'title': 'Smartphone Screen and Digitizer Replacement Guide',
        'category_slug': 'mobile',
        'content': """Symptoms of a faulty smartphone screen include cracks, flickering display, non-responsive touch (digitizer failure), or completely black screen.
First, perform a safety check: power down the device completely and disconnect the battery to avoid short circuits.
Use a heat gun or heating pad set to 80°C for 3-5 minutes to soften the adhesive around the perimeter of the screen glass.
Apply a suction cup to the screen and gently insert plastic opening picks. Slide the picks around the edges to slice the adhesive. Do not insert tools too deeply to avoid damaging internal flex cables.
Carefully lift the screen and disconnect the digitizer and display flex cables from the logic board. Inspect connectors for corrosion.
Clean any remaining adhesive from the phone chassis using isopropyl alcohol (90%+).
Connect the new screen temporary to test functionality before final adhesion. Check display quality and touch response across all screen areas.
If test passes, apply new adhesive tape or liquid adhesive (like B-7000), align the screen perfectly, press firmly, and secure with clamps for at least 2 hours. Reconnect the battery and close the device.
Required tools: Heat gun, plastic picks, suction cup, spudger, precision screwdrivers, clamps, isopropyl alcohol, adhesive.""",
        'tags': 'screen, touch, display, digitizer, glass, cracked, repair',
        'source': 'Expert Mobile Repair Manual v2.1',
    },
    {
        'title': 'Laptop Fan Cleaning and Thermal Paste Application',
        'category_slug': 'laptop',
        'content': """Laptops running hot, shutting down unexpectedly under load, or having loud fan noise usually suffer from clogged vents or dried thermal paste.
Power down the laptop, unplug the power cord, and remove the bottom case screws. Keep track of screws as they are often different lengths.
Disconnect the battery connector immediately to prevent electrical damage to components.
Locate the heatsink and cooling fans. Remove screws securing the fan and heatsink assemblies.
Use compressed air or a soft brush to clean lint and dust from the fan blades and radiator fin stacks.
Use lint-free wipes and isopropyl alcohol to clean the old, dried thermal paste from the CPU and GPU silicon dies, as well as the copper heatsink contact pads. Be gentle.
Apply a pea-sized amount of high-quality non-conductive thermal paste (e.g., Arctic MX-4) to the center of the CPU and GPU dies. Do not over-apply.
Reinstall the heatsink, tightening screws in a diagonal numbering sequence (cross-pattern) to ensure even pressure distribution.
Reconnect the cooling fan power cables and the main battery. Replace the bottom cover and power on. Run a thermal stress test to verify temperature reductions.
Required tools: Precision screwdrivers, thermal paste, compressed air, soft brush, isopropyl alcohol, lint-free wipes, spudger.""",
        'tags': 'overheating, fan, noise, thermal paste, CPU, GPU, heat, clean',
        'source': 'TechSupport Laptop Standard Procedures',
    },
    {
        'title': 'Ceiling Fan Capacitor and Bearing Troubleshooting',
        'category_slug': 'ceiling-fan',
        'content': """Symptoms of ceiling fan issues include slow rotation speed, humming noise, or fan not starting without a manual push.
Always turn off the main circuit breaker before touching any fan wiring. Verify power is off using a voltage tester.
A slow fan or a fan that hums but doesn't spin is usually caused by a degraded start/run capacitor. Capacitors lose capacitance over time.
Access the fan canopy, locate the capacitor (usually a black rectangular block with ratings like 2.5uF or 3uF), and discharge it safely by shorting its terminals.
Disconnect the capacitor wires, noting their colors. Use a multimeter set to capacitance mode to verify the uF reading. If it is significantly lower than rated, replace it with an identical capacitor.
Humming or grinding noise when turning the fan manually points to dry or damaged ball bearings.
To fix bearings, disassemble the fan motor housing. Clean the bearings with degreaser and lubricate them with high-grade machine oil or sewing machine oil. If bearings are seized or worn out, replace the entire bearing assembly.
Reassemble the fan, reconnect the wires using secure wire nuts, and turn the power back on. Test rotation speed on all levels.
Required tools: Non-contact voltage tester, screwdrivers, wire stripper, multimeter, machine oil, replacement capacitor.""",
        'tags': 'fan, speed, slow, hum, capacitor, bearing, ceiling, voltage',
        'source': 'Appliance Tech Notes 2025',
    },
    {
        'title': 'AC Condenser Cleaning and Refrigerant Leak Checks',
        'category_slug': 'air-conditioner',
        'content': """Air conditioners that blow warm air or short-cycle are often caused by dirty outdoor condenser coils or low refrigerant charge.
Disconnect power to both the indoor and outdoor AC units at the isolation switch or main breaker panel.
Clean the outdoor condenser unit. Remove leaf debris and wash the aluminum fins gently with a garden hose. Spray from inside out. Avoid using high-pressure washers to prevent bending the delicate fins.
If the fan motor or compressor starts but turns off after a few minutes, check the run capacitor in the outdoor unit control box. Look for swelling or bulging at the top of the capacitor shell. Replace if damaged.
If coils are clean and fan is running but cooling is insufficient, check for refrigerant leaks. Look for oily residues on copper line joints, which indicates a leak.
Warning: Refrigerant handling, leak brazing, and system recharging require EPA certification. If a leak is found, call a licensed HVAC technician.
Required tools: Fin comb, garden hose, multimeter, safety glasses, gloves.""",
        'tags': 'AC, cool, warm air, condenser, coil, leak, capacitor, outdoor',
        'source': 'HVAC Service Standard Operating Procedures',
    },
]


class Command(BaseCommand):
    help = 'Seeds database with electronic device repair articles and generates vector embeddings'

    def handle(self, *args, **options):
        self.stdout.write('Seeding repair knowledge articles...')
        articles_created = 0
        embeddings_created = 0

        for article_data in KNOWLEDGE_ARTICLES:
            category_slug = article_data.pop('category_slug')
            category = None
            if category_slug:
                try:
                    category = DeviceCategory.objects.get(slug=category_slug)
                except DeviceCategory.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(
                            f'  ! Category slug "{category_slug}" not found. Skipping link.'
                        )
                    )

            article, created = KnowledgeArticle.objects.get_or_create(
                title=article_data['title'],
                defaults={
                    'device_category': category,
                    'content': article_data['content'],
                    'tags': article_data['tags'],
                    'source': article_data['source'],
                    'is_active': True,
                },
            )

            if created:
                articles_created += 1
                self.stdout.write(
                    self.style.SUCCESS(f'  [Created] article: {article.title}')
                )

                # Split article content into chunks for embedding
                # Each chunk will represent a logical paragraph (split by double newline or similar)
                chunks = [chunk.strip() for chunk in article.content.split('\n\n') if chunk.strip()]

                for idx, chunk in enumerate(chunks):
                    # Generate embedding vector
                    vector = generate_embedding(chunk)
                    if vector:
                        KnowledgeEmbedding.objects.create(
                            article=article,
                            chunk_text=chunk,
                            embedding=vector,
                            metadata={'chunk_index': idx},
                        )
                        embeddings_created += 1
                        self.stdout.write(
                            f'    * Embedded chunk {idx+1}/{len(chunks)}'
                        )
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'    ! Failed to embed chunk {idx+1}'
                            )
                        )
            else:
                self.stdout.write(f'  - Article exists: {article.title}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSeeding complete! Created {articles_created} articles and {embeddings_created} embeddings.'
            )
        )
