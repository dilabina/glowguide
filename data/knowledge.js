// GlowGuide - Knowledge Base Data
// Definisi Jenis Kulit, Bentuk Wajah, Masalah Kulit, Kompatibilitas Bahan, dan Glosarium GlowPedia

const SKIN_TYPES_INFO = {
  berminyak: {
    name: 'Kulit Berminyak (Oily Skin)',
    description: 'Produksi sebum berlebih di seluruh area wajah, pori-pori tampak besar, dan rentan komedo/jerawat.',
    routineAdvice: 'Fokus pada pembersih berbahan gel dengan pH seimbang, toner hidrasi ringan, dan sunscreen bebas minyak non-comedogenic.'
  },
  kering: {
    name: 'Kulit Kering (Dry Skin)',
    description: 'Kurang kelembapan alami, terasa kencang ketarik setelah mencuci muka, dan rentan mengelupas atau bersisik.',
    routineAdvice: 'Gunakan pembersih bertekstur krim lembut, hydrating toner berlapis, serum Hyaluronic Acid, dan pelembap kaya ceramide.'
  },
  kombinasi: {
    name: 'Kulit Kombinasi (Combination Skin)',
    description: 'Area T-Zone (dahi, hidung, dagu) berminyak, sedangkan area pipi cenderung normal atau kering.',
    routineAdvice: 'Gunakan pembersih lembut seimbang, pelembap gel ringan di T-zone, dan hidrasi ekstra di area pipi.'
  },
  sensitif: {
    name: 'Kulit Sensitif (Sensitive Skin)',
    description: 'Mudah memerah, terasa perih atau gatal saat terpapar zat tertentu, dan skin barrier mudah terganggu.',
    routineAdvice: 'Pilih produk bebas alkohol dan pewangi (fragrance-free), perkaya Centella Asiatica, Ceramide, dan Panthenol.'
  },
  normal: {
    name: 'Kulit Normal Seimbang (Balanced Skin)',
    description: 'Keseimbangan minyak dan air ideal, tekstur kulit halus, dan jarang mengalami breakout parah.',
    routineAdvice: 'Pertahankan fungsi skin barrier dengan rutinitas dasar: Cleanser lembut, pelembap terhidrasi, dan tabir surya SPF 35+.'
  }
};

const SKIN_CONCERNS_INFO = {
  jerawat: { name: 'Jerawat Aktif (Acne Breakout)' },
  kusam: { name: 'Kulit Kusam & Gelap' },
  bekas: { name: 'Bekas Jerawat (PIH / PIE)' },
  pori: { name: 'Pori-Pori Besar & Komedo' },
  barrier: { name: 'Skin Barrier Rusak' },
  minyak: { name: 'Minyak Berlebih & Kilap' }
};

const FACE_SHAPES_INFO = {
  bulat: {
    name: 'Bentuk Wajah Bulat (Round Face)',
    tagline: 'Rasio panjang dan lebar wajah mendekati seimbang dengan lekukan rahang yang lembut.',
    visualCharacteristics: 'Garis rahang melengkung lembut tanpa sudut tajam, pipi tampak penuh dan menggemaskan (chubby).',
    makeupGoal: 'Menciptakan ilusi wajah lebih tirus, terdefinisi, dan jenjang.',
    quickTips: 'Aplikasikan shading di bawah tulang pipi melandai ke arah sudut bibir, dan blush on diagonal ke pelipis.',
    contour: 'Aplikasikan contour di sepanjang garis rahang samping dan di bawah tulang pipi.',
    blush: 'Aplikasikan blush on diagonal ditarik ke arah atas pelipis untuk efek lifted.',
    eyebrow: 'Bentuk alis dengan lengkungan tegas (high arch) untuk mengimbangi kelembutan kontur wajah.'
  },
  oval: {
    name: 'Bentuk Wajah Oval (Ideal Balance)',
    tagline: 'Proporsi wajah paling seimbang dan fleksibel untuk berbagai gaya riasan.',
    visualCharacteristics: 'Panjang wajah sekitar 1.3 - 1.5 kali lebarnya dengan garis rahang melandai anggun.',
    makeupGoal: 'Menonjolkan simetri alami wajah tanpa koreksi berlebihan.',
    quickTips: 'Gunakan contour tipis di pelipis dan tulang pipi, blush on tepat di apel pipi tersenyum.',
    contour: 'Cukup sedikit shading di bawah tulang pipi untuk mempertegas dimensi.',
    blush: 'Blush on bulat di apel pipi dibaurkan lembut ke arah luar.',
    eyebrow: 'Bentuk alis melengkung lembut (soft angled) mengikuti bingkai tulang alis alami.'
  },
  kotak: {
    name: 'Bentuk Wajah Kotak (Square Face)',
    tagline: 'Garis rahang tegas berkarakter dengan lebar dahi dan rahang yang proporsional sejajar.',
    visualCharacteristics: 'Sudut rahang 90° tampak tegas, lebar pelipis dahi sejajar dengan sudut rahang bawah.',
    makeupGoal: 'Melembutkan sudut-sudut tegas di rahang dan dahi agar tampak lebih feminin.',
    quickTips: 'Fokuskan shading di sudut rahang kiri & kanan serta sudut pelipis dahi.',
    contour: 'Shading lembut di kedua sudut rahang bawah untuk memperhalus siluet.',
    blush: 'Blush on fokus di apel pipi dengan gerakan memutar lembut.',
    eyebrow: 'Alis melengkung lembut (soft curved) tanpa sudut tajam untuk menyeimbangkan rahang.'
  },
  hati: {
    name: 'Bentuk Wajah Hati (Heart / V-Shape)',
    tagline: 'Dahi dan pelipis lebar dengan dagu runcing anggun khas bentuk V-Line.',
    visualCharacteristics: 'Area dahi dan tulang pipi adalah bagian terlebar, meruncing tajam ke dagu yang mungil.',
    makeupGoal: 'Menyeimbangkan lebar dahi dengan proporsi dagu yang ramping.',
    quickTips: 'Beri shading pada kedua sisi pelipis dahi, dan hindari contour di area dagu.',
    contour: 'Shading di sudut kiri & kanan dahi bagian atas untuk mempersempit area dahi.',
    blush: 'Aplikasikan blush on horizontal di bawah tulang pipi.',
    eyebrow: 'Alis melengkung rendah yang anggun untuk melembutkan dahi lebar.'
  },
  lonjong: {
    name: 'Bentuk Wajah Lonjong (Oblong / Long Face)',
    tagline: 'Wajah jenjang elegan dengan rasio panjang yang lebih dominan.',
    visualCharacteristics: 'Panjang wajah lebih dari 1.5 kali lebarnya, garis sisi wajah cenderung lurus vertikal.',
    makeupGoal: 'Menciptakan ilusi wajah lebih proporsional dan tidak terlalu panjang.',
    quickTips: 'Beri shading horizontal di puncak dahi dan ujung bawah dagu.',
    contour: 'Shading tipis di batas rambut dahi atas dan bagian bawah dagu.',
    blush: 'Blush on horizontal melebar dari apel pipi ke arah telinga.',
    eyebrow: 'Bentuk alis mendatar ala Korea (straight brows) untuk memotong kesan panjang wajah.'
  },
  diamond: {
    name: 'Bentuk Wajah Berlian (Diamond Face)',
    tagline: 'Tulang pipi tinggi dramatis dengan dahi dan dagu yang meramping simetris.',
    visualCharacteristics: 'Tulang pipi adalah titik terlebar wajah, dipadukan dengan dahi sempit dan dagu runcing.',
    makeupGoal: 'Melembutkan ketajaman tulang pipi dan menyeimbangkan lebar dahi.',
    quickTips: 'Fokuskan blush on di bagian tengah pipi, highlight di dahi tengah dan dagu.',
    contour: 'Shading tipis tepat di puncak tonjolan tulang pipi.',
    blush: 'Blush on di apel pipi sedikit membaur ke dalam.',
    eyebrow: 'Alis melengkung anggun dengan lengkungan melingkar (curved arch).'
  }
};

const INGREDIENTS_COMPATIBILITY = [
  {
    ing1: 'Retinol',
    ing2: 'Niacinamide',
    color: 'emerald',
    title: 'Kombinasi Sempurna untuk Anti-Aging & Mencerahkan',
    description: 'Niacinamide memperkuat skin barrier dan mengurangi potensi iritasi dari Retinol. Kombinasi ini sangat efektif untuk menyamarkan garis halus dan noda hitam.'
  },
  {
    ing1: 'Retinol',
    ing2: 'Vitamin C',
    color: 'amber',
    title: 'Gunakan Bergantian (Pagi & Malam)',
    description: 'Keduanya merupakan bahan aktif potent dengan tingkat pH kerja yang berbeda. Gunakan Vitamin C di pagi hari untuk antioksidan, dan Retinol di malam hari untuk regenerasi.'
  },
  {
    ing1: 'Retinol',
    ing2: 'AHA/BHA',
    color: 'rose',
    title: 'Hindari Dipakai Bersamaan di Malam yang Sama',
    description: 'Mencampur Retinol dengan bahan eksfoliasi kuat (AHA/BHA) dapat mengikis skin barrier, menyebabkan kemerahan, kulit mengelupas, dan iritasi parah. Berikan jeda malam berbeda (Skin Cycling).'
  },
  {
    ing1: 'Vitamin C',
    ing2: 'Niacinamide',
    color: 'emerald',
    title: 'Formula Modern Stabil & Ampuh Mencerahkan',
    description: 'Penelitian terbaru membuktikan formulasi modern Vitamin C dan Niacinamide bekerja sangat baik secara sinergis untuk memudarkan noda PIH dan meratakan warna kulit.'
  },
  {
    ing1: 'AHA/BHA',
    ing2: 'Niacinamide',
    color: 'emerald',
    title: 'Kombinasi Pori Bersih & Reda Kemerahan',
    description: 'AHA/BHA membersihkan kotoran dan sel kulit mati di pori-pori, sementara Niacinamide meredakan inflamasi serta mengontrol produksi sebum.'
  },
  {
    ing1: 'Hyaluronic Acid',
    ing2: 'Ceramide',
    color: 'emerald',
    title: 'Duo Juara Pemulihan Skin Barrier',
    description: 'Hyaluronic Acid mengikat molekul air ke dalam lapisan epidermis, sementara Ceramide mengunci kelembapan tersebut agar tidak menguap. Sangat aman dicampur dengan apapun.'
  },
  {
    ing1: 'Centella Asiatica',
    ing2: 'Salicylic Acid',
    color: 'emerald',
    title: 'Solusi Jerawat Meradang Tanpa Iritasi',
    description: 'Salicylic Acid (BHA) masuk ke dalam pori untuk membunuh bakteri jerawat, sedangkan Centella Asiatica menenangkan kemerahan dan mempercepat penyembuhan luka jerawat.'
  }
];

const GLOWPEDIA_TERMS = [
  {
    term: 'Skin Barrier',
    category: 'Struktur Kulit',
    description: 'Lapisan pelindung terluar kulit (stratum corneum) yang tersusun atas lipid dan ceramide, berfungsi menahan hidrasi dan mencegah masuknya bakteri atau iritan.'
  },
  {
    term: 'Double Cleansing',
    category: 'Metode Perawatan',
    description: 'Langkah pembersihan wajah dua tahap: tahap pertama menggunakan pembersih berbahan dasar minyak/micellar water untuk melarutkan makeup dan sunscreen, dilanjutkan pembersih berbasis air (facial wash).'
  },
  {
    term: 'PIH vs PIE',
    category: 'Masalah Kulit',
    description: 'PIH (Post-Inflammatory Hyperpigmentation) adalah noda bekas jerawat berwarna cokelat/hitam akibat kelebihan melanin, sedangkan PIE (Post-Inflammatory Erythema) adalah noda merah/keunguan akibat pelebaran pembuluh darah kapiler.'
  },
  {
    term: 'Skin Cycling',
    category: 'Metode Perawatan',
    description: 'Metode penggunaan skincare malam dalam siklus 4 hari: Malam 1 Eksfoliasi (AHA/BHA), Malam 2 Retinol, Malam 3 & 4 Pemulihan (Hydrating & Barrier), lalu diulang kembali.'
  },
  {
    term: 'Non-Comedogenic',
    category: 'Klaim Produk',
    description: 'Formulasi produk yang telah teruji klinis tidak menyumbat pori-pori kulit sehingga meminimalkan risiko timbulnya komedo dan jerawat baru.'
  },
  {
    term: 'SPF & PA++++',
    category: 'Perlindungan UV',
    description: 'SPF (Sun Protection Factor) melindungi kulit dari sinar UVB penyebab sunburn (kulit gosong/terbakar), sedangkan PA (Protection Grade of UVA) dengan tanda plus (+) melindungi dari sinar UVA penyebab penuaan dini dan flek hitam.'
  },
  {
    term: 'Ombre Lips',
    category: 'Teknik Makeup',
    description: 'Gaya riasan bibir gradasi khas Asia di mana warna nude diaplikasikan di bagian tepi luar bibir dan warna lebih terang/gelap di bagian tengah dalam bibir.'
  }
];
