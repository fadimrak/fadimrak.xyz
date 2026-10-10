// Bağlantı kategori bankası: [seviye (0 kolay → 3 zor), ad, kelimeler, seçenekler]
// pre: bu harflerle başlayan her kelime bu gruba da uyar sayılır (aynı bulmacada çakışmasın diye)
// pal: tersten okununca aynı olan her kelime bu gruba da uyar sayılır
// x: bu kategorilerle aynı bulmacaya hiç düşmez
const KATEGORILER = [
  // ——— seviye 0
  [0, 'Meyveler', 'ELMA ARMUT KİRAZ ÇİLEK MUZ ŞEFTALİ KAYISI ERİK KARPUZ NAR AYVA İNCİR DUT ÜZÜM'],
  [0, 'Sebzeler', 'DOMATES PATLICAN KABAK BİBER HAVUÇ ISPANAK PIRASA LAHANA SARIMSAK SOĞAN'],
  [0, 'Renkler', 'KIRMIZI MAVİ YEŞİL SARI MOR TURUNCU PEMBE LACİVERT'],
  [0, 'Evcil hayvanlar', 'KEDİ KÖPEK HAMSTER TAVŞAN BALIK KAPLUMBAĞA PAPAĞAN'],
  [0, 'Mutfak eşyaları', 'TENCERE TAVA KEPÇE SÜZGEÇ RENDE MERDANE ÇAYDANLIK'],
  [0, 'Mobilya', 'MASA SANDALYE DOLAP KOLTUK YATAK SEHPA KOMODİN ABAJUR'],
  [0, 'Giysiler', 'GÖMLEK PANTOLON ETEK CEKET KAZAK MONT YELEK'],
  [0, 'Okul eşyaları', 'KALEM SİLGİ DEFTER CETVEL KALEMTIRAŞ PERGEL ÇANTA'],
  [0, 'Meslekler', 'DOKTOR ÖĞRETMEN AVUKAT MÜHENDİS HEMŞİRE PİLOT AŞÇI SUBAY ŞOFÖR KUAFÖR'],
  [0, 'Sporlar', 'FUTBOL BASKETBOL VOLEYBOL TENİS YÜZME GÜREŞ BOKS KAYAK'],
  [0, 'Taşıtlar', 'OTOBÜS TRAMVAY VAPUR METRO TAKSİ UÇAK TREN'],
  [0, 'Hava olayları', 'YAĞMUR KAR DOLU SİS RÜZGAR FIRTINA ŞİMŞEK'],
  [0, 'Organlar', 'KALP AKCİĞER BÖBREK KARACİĞER MİDE BEYİN DALAK'],
  [0, 'Müzik aletleri', 'BAĞLAMA KEMAN DAVUL ZURNA PİYANO GİTAR FLÜT KANUN'],
  [0, 'İçecekler', 'ÇAY AYRAN ŞALGAM LİMONATA KAHVE BOZA SAHLEP'],
  [0, 'Vücut', 'KOL BACAK BOYUN OMUZ DİRSEK DİZ BİLEK SURAT'],
  [0, 'Ağaçlar', 'ÇAM MEŞE ÇINAR SÖĞÜT KAVAK IHLAMUR KESTANE'],
  [0, 'Kuşlar', 'SERÇE MARTI LEYLEK BAYKUŞ KARTAL GÜVERCİN KARGA KANARYA'],
  [0, 'Tatlılar', 'BAKLAVA KÜNEFE SÜTLAÇ AŞURE REVANİ KAZANDİBİ TULUMBA ŞEKER'],
  [0, 'Duygular', 'MUTLULUK ÜZÜNTÜ ÖFKE KORKU ŞAŞKINLIK HUZUR ÖZLEM'],
  [0, 'Teknoloji', 'TELEFON BİLGİSAYAR TABLET KULAKLIK KLAVYE MONİTÖR HOPARLÖR'],
  [0, 'Gezegenler', 'MERKÜR VENÜS MARS JÜPİTER SATÜRN URANÜS NEPTÜN'],
  [0, 'Aylar', 'OCAK ŞUBAT MART NİSAN MAYIS HAZİRAN EYLÜL KASIM'],
  [0, 'Haftanın günleri', 'PAZARTESİ SALI ÇARŞAMBA PERŞEMBE CUMA CUMARTESİ PAZAR'],
  [0, 'Şekiller', 'KARE DAİRE ÜÇGEN DİKDÖRTGEN ELİPS YAMUK ALTIGEN'],
  [0, 'Banyoda', 'HAVLU SABUN KÜVET LAVABO DUŞ AYNA ŞAMPUAN'],
  [0, 'Baklagiller', 'NOHUT MERCİMEK FASULYE BAKLA BEZELYE BÖRÜLCE'],
  [0, 'Kuruyemiş', 'FINDIK FISTIK CEVİZ BADEM LEBLEBİ KAJU'],
  [0, 'Kahvaltılık', 'ZEYTİN BAL KAYMAK REÇEL PEYNİR YUMURTA SUCUK'],
  [0, 'Çiçekler', 'GÜL LALE PAPATYA MENEKŞE ORKİDE KARANFİL SÜMBÜL'],
  [0, 'Küçük canlılar', 'ARI KARINCA KELEBEK SİNEK ÖRÜMCEK ÇEKİRGE SİVRİSİNEK'],
  [0, 'Gökyüzünde', 'BULUT AY GÜNEŞ YILDIZ KUYRUKLUYILDIZ GÖKKUŞAĞI'],

  // ——— seviye 1
  [1, 'Kıtalar', 'ASYA AVRUPA AFRİKA ANTARKTİKA AVUSTRALYA'],
  [1, 'Başkentler', 'PARİS ROMA BERLİN MADRİD LONDRA VİYANA ATİNA TOKYO'],
  [1, 'Denizlerimiz', 'KARADENİZ EGE AKDENİZ MARMARA'],
  [1, 'Göller', 'VAN TUZ EĞİRDİR BEYŞEHİR ÇILDIR SAPANCA ABANT'],
  [1, 'Dağlar', 'AĞRI ERCİYES ULUDAĞ PALANDÖKEN KAÇKAR SÜPHAN'],
  [1, 'Nehirler', 'FIRAT DİCLE KIZILIRMAK SAKARYA SEYHAN CEYHAN MERİÇ'],
  [1, 'Peynirler', 'KAŞAR TULUM LOR ÇEÇİL EZİNE MİHALİÇ OTLU'],
  [1, 'Hamur işleri', 'SİMİT POĞAÇA BÖREK PİDE AÇMA GÖZLEME LAHMACUN'],
  [1, 'Mezeler', 'HAYDARİ FAVA ŞAKŞUKA CACIK EZME HUMUS'],
  [1, 'Kebaplar', 'ADANA URFA İSKENDER BEYTİ CAĞ TESTİ ALİNAZİK'],
  [1, 'Baharatlar', 'KİMYON NANE SUMAK KEKİK ZERDEÇAL TARÇIN KARABİBER KARANFİL SUSAM'],
  [1, 'Deniz ürünleri', 'KARİDES MİDYE AHTAPOT KALAMAR İSTAKOZ YENGEÇ'],
  [1, 'Balıklar', 'HAMSİ LEVREK ÇİPURA PALAMUT LÜFER İSTAVRİT ALABALIK'],
  [1, 'Satranç taşları', 'PİYON FİL AT KALE VEZİR ŞAH'],
  [1, 'Burçlar', 'KOÇ BOĞA İKİZLER YENGEÇ ASLAN BAŞAK TERAZİ AKREP OĞLAK KOVA BALIK'],
  [1, 'Takım maskotları', 'KARTAL ASLAN KANARYA FIRTINA TİMSAH'],
  [1, 'Vahşi hayvanlar', 'ZEBRA ZÜRAFA GERGEDAN TİMSAH FİL ASLAN KAPLAN AYI DEVE'],
  [1, 'Halk oyunları', 'HORON ZEYBEK HALAY BAR HORA'],
  [1, 'Kâğıt oyunları', 'PİŞTİ BATAK KING POKER BRİÇ PASTRA'],
  [1, 'Kahve çeşitleri', 'TÜRK FİLTRE ESPRESSO LATTE AMERİKANO MOKA'],
  [1, 'Hamamda', 'KESE PEŞTAMAL KURNA NALIN TAS KÜLHAN'],
  [1, 'Tiyatro terimleri', 'SAHNE PERDE KULİS SUFLÖR DEKOR KOSTÜM REJİ'],
  [1, 'Metaller', 'ALTIN GÜMÜŞ BAKIR DEMİR ÇİNKO KURŞUN ALÜMİNYUM'],
  [1, 'Ölçü birimleri', 'METRE LİTRE GRAM SANİYE AMPER VOLT KELVİN KİLOMETRE'],
  [1, 'Masal kahramanları', 'KELOĞLAN KÜLKEDİSİ PİNOKYO ALADDİN PAMUKPRENSES RAPUNZEL'],
  [1, 'Antik kentler', 'EFES TRUVA BERGAMA AFRODİSİAS HİERAPOLİS ÇATALHÖYÜK GÖBEKLİTEPE'],
  [1, 'Aksesuarlar', 'KEMER KRAVAT ŞAPKA ATKI ELDİVEN BERE GÖZLÜK KUŞAK KALPAK'],
  [1, 'Bilim dalları', 'FİZİK KİMYA BİYOLOJİ ASTRONOMİ JEOLOJİ GENETİK'],
  [1, 'Klavye tuşları', 'ENTER SHIFT CTRL ALT TAB ESC'],
  [1, 'Hayvan sesleri', 'HAV MİYAV VAK MEE GUGUK KUKURİKU'],
  [1, 'Ana yemekler', 'MANTI KARNIYARIK İMAMBAYILDI DOLMA SARMA KUMPİR'],
  [1, 'Futbol mevkileri', 'KALECİ DEFANS FORVET STOPER BEK LİBERO'],

  // ——— seviye 2
  [2, 'Yazar soyadları', 'PAMUK KEMAL ŞAFAK NESİN TANPINAR ATILGAN'],
  [2, 'Yeşilçam yıldızları', 'SUNAL ŞEN ARKIN İNANIR ŞORAY AKIN'],
  [2, 'Şarkıcı adları', 'TARKAN SEZEN AJDA BARIŞ MÜSLÜM ZEKİ'],
  [2, 'Padişah lakapları', 'FATİH YAVUZ KANUNİ YILDIRIM ÇELEBİ'],
  [2, 'Ressamlar', 'PİCASSO DALİ MONET REMBRANDT MATİSSE KLİMT'],
  [2, 'Besteciler', 'MOZART BEETHOVEN BACH CHOPİN VİVALDİ ITRİ'],
  [2, 'Bilim insanları', 'EİNSTEİN NEWTON TESLA CURİE DARWİN GALİLEO'],
  [2, 'Araba markaları', 'TOGG TESLA FİAT RENAULT FORD TOYOTA'],
  [2, 'İstanbul semtleri', 'KADIKÖY BEŞİKTAŞ ÜSKÜDAR FATİH BEYOĞLU SARIYER BAKIRKÖY'],
  [2, 'Ankara semtleri', 'KIZILAY ÇANKAYA ULUS KEÇİÖREN ETİMESGUT SİNCAN'],
  [2, 'İzmir semtleri', 'ALSANCAK KARŞIYAKA BORNOVA KONAK BUCA GÜZELYALI'],
  [2, 'Adalar', 'BÜYÜKADA HEYBELİADA BURGAZADA KINALIADA GÖKÇEADA BOZCAADA'],
  [2, 'Kapadokya', 'GÖREME ÜRGÜP UÇHİSAR AVANOS ORTAHİSAR'],
  [2, 'Mimar Sinan camileri', 'SÜLEYMANİYE SELİMİYE ŞEHZADE MİHRİMAH SOKOLLU'],
  [2, 'Ünlü sultan hanımlar', 'HÜRREM KÖSEM MİHRİMAH NURBANU SAFİYE'],
  [2, '___spor', 'BURSA TRABZON KONYA SİVAS KAYSERİ ANTALYA ADANA URFA SAKARYA'],
  [2, 'Yunan tanrıları', 'ZEUS HERA APOLLON ATHENA HERMES POSEİDON ARES'],
  [2, 'Masa oyunları', 'SATRANÇ TAVLA OKEY MONOPOLY DAMA SCRABBLE TABU'],
  [2, 'Video oyunları', 'MINECRAFT FORTNITE TETRIS ROBLOX ZELDA SONIC'],
  [2, 'Sosyal medya', 'INSTAGRAM TWITTER TIKTOK YOUTUBE FACEBOOK SNAPCHAT'],
  [2, 'Çizgi film karakterleri', 'TOM JERRY GARFIELD SPONGEBOB PIKACHU SCOOBY'],
  [2, 'Kedi türleri', 'VAN TEKİR SİYAM ANKARA İRAN'],
  [2, 'Okey terimleri', 'ISTAKA OKEY GÖSTERGE ÇİFT SAHTE'],
  [2, 'Tavla terimleri', 'PUL ZAR MARS ŞEŞBEŞ DÜBEŞ HEPYEK'],
  [2, 'Ünlü köprüler', 'GALATA UNKAPANI BOĞAZİÇİ OSMANGAZİ HALİÇ'],

  // ——— seviye 3 (kelime oyunları)
  [3, '___ çayı', 'ADA KUŞBURNU IHLAMUR ELMA PAPATYA'],
  [3, 'GÖZ ile başlar', 'GÖZLÜK GÖZLEME GÖZCÜ GÖZYAŞI GÖZDE', { pre: ['GÖZ'] }],
  [3, 'SU ile başlar', 'SUCUK SUBAY SUÇLU SUSAM SURAT SUPAP', { pre: ['SU'] }],
  [3, 'KAR ile başlar', 'KARPUZ KARGA KARINCA KARANFİL KARTAL KARDEŞ KARAKOL', { pre: ['KAR'] }],
  [3, '___ Bayramı', 'RAMAZAN KURBAN ŞEKER CUMHURİYET ZAFER'],
  [3, 'Başında hayvan saklı', 'ARIZA KUŞAK ATLAS FİLM AYIP KAZMA', { pre: ['ARI', 'AT', 'AYI', 'KUŞ', 'FİL', 'KAZ', 'BOĞA', 'İNEK', 'KEDİ', 'KOYUN', 'TAVUK'], x: ['Evcil hayvanlar', 'Vahşi hayvanlar', 'Kuşlar', 'Küçük canlılar', 'Balıklar', 'Deniz ürünleri', 'Burçlar', 'Takım maskotları', '___ balığı', '___ kuşu', '___ atı'] }],
  [3, 'Başında renk saklı', 'MORAL SARIMSAK KARAKOL BOZUK AKŞAM ALKIŞ', { pre: ['MOR', 'SARI', 'KARA', 'BOZ', 'AK', 'AL', 'MAVİ'], x: ['Renkler'] }],
  [3, 'Başında sayı saklı', 'BİRADER İKİZ BEŞİK ALTIN ONUR ÜÇGEN', { pre: ['BİR', 'İKİ', 'ÜÇ', 'DÖRT', 'BEŞ', 'ALTI', 'YEDİ', 'SEKİZ', 'DOKUZ', 'ON'] }],
  [3, 'Başında organ saklı', 'KALPAK BELGE DİLEK KOLAY DİZİ ELÇİ', { pre: ['KALP', 'BEL', 'DİL', 'KOL', 'DİZ', 'EL', 'BEYİN', 'DİŞ', 'KAŞ', 'GÖZ', 'BURUN', 'KULAK', 'MİDE'], x: ['Organlar', 'Vücut'] }],
  [3, 'Başında meyve saklı', 'NARİN ELMAS AYVALIK İNCİRLİK ERİKLİ', { pre: ['NAR', 'ELMA', 'AYVA', 'İNCİR', 'ERİK', 'DUT', 'KİRAZ', 'MUZ', 'ÜZÜM'], x: ['Meyveler'] }],
  [3, 'Tersten de aynı', 'KAPAK KABAK KAZAK KÜTÜK KAYAK NEDEN', { pal: true }],
  [3, '___ balığı', 'KILIÇ AY JAPON KÖPEK KEDİ'],
  [3, '___ kuşu', 'MUHABBET SAKA DEVE SİNEK ÇALI ARI'],
  [3, '___ yolu', 'İPEK SAMAN DEMİR KARA DENİZ HAVA'],
  [3, '___ atı', 'TRUVA DENİZ YARIŞ ARAP'],
  [3, '___ taşı', 'BÖBREK OKEY MEZAR KİLOMETRE MİHENK SINIR'],
  [3, 'Fransızcadan geçti', 'ŞOFÖR KUAFÖR ASANSÖR ABAJUR BÜRO PANTOLON'],
  [3, 'İtalyancadan geçti', 'FIRTINA İSKELE FATURA BANKA LOTARYA KUMPANYA'],
  [3, 'İstanbul\'un eski adları', 'BİZANS KONSTANTİNOPOLİS DERSAADET ASİTANE İSLAMBOL'],
  [3, '___kapı (İstanbul)', 'TOP EDİRNE YENİ SİLİVRİ'],
  [3, 'Ünlü ikililerin bir yarısı', 'KARAGÖZ LEYLA FERHAT KEREM TAHİR'],
].map(([level, name, words, o = {}]) => ({ level, name, words: words.split(' '), pre: o.pre || [], pal: !!o.pal, x: o.x || [] }));

const isPal = w => w.length > 2 && [...w].reverse().join('') === w;
const fits = (w, c) => c.words.includes(w) || c.pre.some(p => w.startsWith(p)) || (c.pal && isPal(w));

// Tohuma göre bulmaca üret: her seviyeden bir kategori, her kelime tek bir gruba uyacak şekilde
function makePuzzle(rand) {
  const byLevel = [0, 1, 2, 3].map(l => KATEGORILER.filter(c => c.level === l));
  for (let tries = 0; tries < 2000; tries++) {
    const cats = byLevel.map(list => list[Math.floor(rand() * list.length)]);
    if (cats.some(a => cats.some(b => a !== b && a.x.includes(b.name)))) continue;
    const groups = cats.map(c => {
      const own = c.words.filter(w => !cats.some(o => o !== c && fits(w, o)));
      return own.length >= 4 ? { name: c.name, level: c.level, words: shuffle(own, rand).slice(0, 4) } : null;
    });
    if (groups.every(Boolean)) return groups;
  }
  throw new Error('bulmaca üretilemedi');
}
