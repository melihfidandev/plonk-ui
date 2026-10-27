"use client";

import {
  Accordion,
  AccordionItem,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Calendar,
  Card,
  Checkbox,
  cn,
  CommandGroup,
  CommandItem,
  CommandPage,
  CommandPalette,
  CommandPaletteTrigger,
  createDataTableColumns,
  DataTable,
  ComboBox,
  ComboBoxItem,
  contrastRatio,
  DateRangePicker,
  DatePicker,
  DEFAULT_PERSONALITY,
  Dialog,
  DialogTrigger,
  Drawer,
  getLocalTimeZone,
  Input,
  Kbd,
  Menu,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  MOTION_TOKENS,
  overshoot,
  PERSONALITY_NAMES,
  personalities,
  PlonkProvider,
  Popover,
  Progress,
  Radio,
  RadioGroup,
  RangeCalendar,
  resolveEasing,
  sampleEasing,
  Select,
  SelectItem,
  Slider,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  toast,
  today,
  Tooltip,
  TooltipTrigger,
  type ButtonSize,
  type ButtonVariant,
  type CalendarPreset,
  type ColorToken,
  type DateValue,
  type MotionToken,
  type PersonalityName,
  type ToastPlacement,
} from "plonk";
import { useRef, useState, useSyncExternalStore } from "react";

// Tailwind'in sınıfları görebilmesi için tam adlarıyla.
const MOTION_CLASS: Record<MotionToken, string> = {
  press: "plonk-motion-press",
  spring: "plonk-motion-spring",
  snap: "plonk-motion-snap",
  enter: "plonk-motion-enter",
  exit: "plonk-motion-exit",
};

const SWATCHES: [ColorToken, ColorToken | null][] = [
  ["canvas", "ink"],
  ["surface", "ink"],
  ["primary", "onPrimary"],
  ["accent", "onAccent"],
  ["secondary", "onSecondary"],
  ["success", "onSuccess"],
  ["warning", "onWarning"],
  ["danger", "onDanger"],
  ["inkMuted", null],
  ["focus", null],
];

const cssVar = (token: ColorToken) =>
  `var(--plonk-color-${token.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)})`;

// Kişilik adreste durur (/lab#retro), böylece doğrudan link verilebilir.
const subscribeHash = (onChange: () => void) => {
  addEventListener("hashchange", onChange);
  return () => removeEventListener("hashchange", onChange);
};
const readHash = (): PersonalityName => {
  const hash = location.hash.slice(1);
  return (PERSONALITY_NAMES as readonly string[]).includes(hash)
    ? (hash as PersonalityName)
    : DEFAULT_PERSONALITY;
};

export function MotionLab() {
  const name = useSyncExternalStore(
    subscribeHash,
    readHash,
    () => DEFAULT_PERSONALITY,
  );
  const [reduce, setReduce] = useState(false);
  const [jelly, setJelly] = useState<number | null>(null);
  const [placement, setPlacement] = useState<ToastPlacement>("bottom-end");
  const p = personalities[name];
  const jellyValue = jelly ?? p.jelly.amount;

  const choose = (n: PersonalityName) => {
    setJelly(null);
    history.replaceState(null, "", `#${n}`);
    dispatchEvent(new HashChangeEvent("hashchange"));
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-black bg-[#fafaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <div className="mr-auto">
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-50">
              Aşama 4 · komut paleti, slider, veri tablosu
            </p>
            <h1 className="text-xl font-black tracking-tight">Laboratuvar</h1>
          </div>

          <div
            role="radiogroup"
            aria-label="Kişilik"
            className="flex rounded-full border-2 border-black p-0.5"
          >
            {PERSONALITY_NAMES.map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={name === n}
                onClick={() => choose(n)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold",
                  name === n ? "bg-black text-white" : "hover:bg-black/5",
                )}
              >
                {personalities[n].label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold">
            Jöle
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.05}
              value={jellyValue}
              disabled={reduce}
              onChange={(e) => setJelly(Number(e.target.value))}
              className="w-32 accent-black"
            />
            <output className="w-10 font-mono tabular-nums">
              {reduce ? "0" : jellyValue.toFixed(2)}
            </output>
            {jelly !== null && (
              <button
                onClick={() => setJelly(null)}
                className="text-xs underline opacity-60"
              >
                varsayılan ({p.jelly.amount})
              </button>
            )}
          </label>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={reduce}
              onChange={(e) => setReduce(e.target.checked)}
              className="size-4 accent-black"
            />
            Hareketi azalt
          </label>
        </div>
      </header>

      <PlonkProvider
        personality={name}
        motion={reduce ? "reduce" : "system"}
        jelly={jelly ?? undefined}
        toastPlacement={placement}
        locale="tr-TR"
        className="flex-1 bg-plonk-canvas"
      >
        <div className="mx-auto grid max-w-6xl gap-16 px-4 py-14">
          <section>
            <h2 className="font-plonk-display text-5xl leading-none">
              {p.label}
            </h2>
            <p className="mt-3 max-w-prose text-lg">{p.description}</p>
          </section>

          <Section
            title="Veri tablosu"
            note="2.000 satır, sanal kaydırma. Başlığa tıkla: artan → azalan → sırasız (Shift ile çoklu sıralama). Ara, durum ve tarih filtresini dene, Sütunlar menüsünden gizle, başlık kenarından genişliği sürükle. Satır seç: alttan işlem çubuğu gelir."
          >
            <TableLab />
          </Section>

          <Section
            title="Komut paleti"
            note="⌘K / Ctrl+K ya da arama kutusuna tıkla. Yaz (bulanık arama: “yfat”), ok tuşlarıyla gez, Enter. “Tema değiştir” alt sayfa açar: Backspace ya da Esc ile geri. 2+ harf yazınca müşteri araması (sahte sunucu) gelir."
          >
            <div className="max-w-sm">
              <CommandPaletteTrigger>
                Komut ya da müşteri ara…
              </CommandPaletteTrigger>
            </div>
            <CommandLab onPersonality={choose} />
          </Section>

          <Section
            title="Slider"
            note="Hızlı ve yavaş sürükle: Sticker'da tutamaç uzar, etiket yaylı gecikmeyle izler. Retro'da tutamaç adım adım zıplar. Tab ile tutamaca gel; oklar, PageUp/PageDown, Home/End."
          >
            <SliderLab />
          </Section>

          <Section
            title="Toast"
            note="Sticker yapışır ve köşeden soyulur, Retro pencere olarak belirip başlık çubuğuna katlanır. Üstüne gel: süreler durur. Sağa ya da sola sürükle: kapanır. F6 ile bildirimlere atla."
          >
            <ToastLab placement={placement} onPlacement={setPlacement} />
          </Section>

          <Section
            title="Date Picker"
            note="Gün, ay ve yılı yaz ya da ok tuşlarıyla değiştir; takvim düğmesiyle aç. Takvimde ok tuşları günler, PageUp/PageDown aylar arasında gezer. Pazar günleri kapalı örneği."
          >
            <DateLab />
          </Section>

          <Section
            title="Dialog"
            note="Aç, Tab ile gez, Esc ile kapat: odak içeride kalır ve kapanınca açan düğmeye döner."
          >
            <DialogLab />
          </Section>

          <Section
            title="Tabs, Accordion"
            note="Sekmeler arasında gez: gösterge yayla kayıp ezilir. Ok tuşları da çalışır. Accordion'da yükseklik yayla açılır."
          >
            <StructureLab />
          </Section>

          <Section
            title="Menu, Select, ComboBox"
            note="Seçenekler sırayla düşer. Ok tuşları, Enter, Esc ve yazarak arama çalışır. ComboBox'ta yazdıkça eşleşen harfler vurgulanır."
          >
            <SelectionLab />
          </Section>

          <Section
            title="Drawer, Popover, Tooltip"
            note="Drawer kenardan yayla gelir. Popover tıklanan noktadan büyür. Tooltip için simgelerin üzerine gel ya da Tab ile odaklan."
          >
            <LayersLab />
          </Section>

          <Section
            title="Button"
            note="Basınca gölgesinin yerine iner, bırakınca yayla çıkıp esner. Klavyeyle (Tab, Enter, Boşluk) de dene."
          >
            <ButtonLab />
          </Section>

          <Section
            title="Form"
            note="Alana odaklan: kalkar ve odak renginde gölge bırakır. Boş gönder: hata sallanarak gelir."
          >
            <FormLab />
          </Section>

          <Section
            title="Gösterim"
            note="Card, Badge, Avatar, Progress, Kbd. Retro'da her kart bir pencere."
          >
            <DisplayLab />
          </Section>

          <Section
            title="Hareket token'ları"
            note="Her token bir eğri ve bir süre. Oynat'a basıp karşılaştır."
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(MOTION_TOKENS) as MotionToken[]).map((k) => (
                <MotionCard
                  key={k}
                  token={k}
                  personality={name}
                  reduce={reduce}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Renkler"
            note="Metin çiftlerinin hepsi en az 4.5:1 kontrastta (testlerle güvence altında)."
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {SWATCHES.map(([bg, fg]) => (
                <div
                  key={bg}
                  className="overflow-hidden rounded-plonk-md bg-plonk-surface plonk-shadow plonk-border"
                >
                  <div
                    className="flex h-20 items-end p-3 font-plonk-display text-2xl"
                    style={{
                      background: cssVar(bg),
                      color: fg ? cssVar(fg) : undefined,
                    }}
                  >
                    {fg ? "Aa" : ""}
                  </div>
                  <div className="border-t-(length:--plonk-border-width) border-plonk-ink p-3 text-sm">
                    <p className="font-bold">{bg}</p>
                    <p className="font-plonk-mono text-xs text-plonk-ink-muted">
                      {p.color[bg]}
                    </p>
                    {fg && (
                      <p className="mt-1 text-xs text-plonk-ink-muted">
                        {contrastRatio(p.color[bg], p.color[fg]).toFixed(1)}:1
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            title="Biçim"
            note="Çerçeve, gölge, köşe ve eğim token'ları."
          >
            <div className="flex flex-wrap items-end gap-6">
              {(["sm", "md", "lg"] as const).map((r, i) => (
                <div
                  key={r}
                  className={cn(
                    "grid size-28 place-items-center bg-plonk-surface font-bold plonk-shadow plonk-border",
                    r === "sm" && "rounded-plonk-sm",
                    r === "md" && "rounded-plonk-md",
                    r === "lg" && "rounded-plonk-lg",
                    i === 1 && "plonk-tilt",
                  )}
                >
                  radius-{r}
                </div>
              ))}
              <div className="grid h-28 w-44 plonk-tilt-reverse place-items-center rounded-plonk-md bg-plonk-accent font-bold text-plonk-on-accent plonk-shadow-lg plonk-border">
                shadow-lg + tilt
              </div>
              <span className="rounded-plonk-pill bg-plonk-success px-4 py-1 text-sm font-bold text-plonk-on-success plonk-border">
                pill
              </span>
            </div>
            <dl className="mt-6 grid max-w-md grid-cols-2 gap-x-6 gap-y-1 font-plonk-mono text-sm">
              <dt className="text-plonk-ink-muted">border-width</dt>
              <dd>{p.border.width}</dd>
              <dt className="text-plonk-ink-muted">shadow</dt>
              <dd>
                {p.shadow.x} {p.shadow.y}
              </dd>
              <dt className="text-plonk-ink-muted">tilt</dt>
              <dd>{p.tilt}</dd>
            </dl>
          </Section>
        </div>
      </PlonkProvider>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-plonk-display text-3xl leading-none">{title}</h3>
      <p className="mt-2 mb-6 text-plonk-ink-muted">{note}</p>
      {children}
    </section>
  );
}

const VARIANTS: ButtonVariant[] = [
  "primary",
  "secondary",
  "accent",
  "danger",
  "neutral",
  "ghost",
];
const SIZES: ButtonSize[] = ["sm", "md", "lg"];

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
    <path
      d="M5 12h13m-5-6 6 6-6 6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function ButtonLab() {
  const [saving, setSaving] = useState(false);
  const [count, setCount] = useState(0);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1800);
  };

  return (
    <div className="grid gap-10">
      <div className="flex flex-wrap items-center gap-4">
        {VARIANTS.map((v) => (
          <Button key={v} variant={v}>
            {v}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {SIZES.map((s) => (
          <Button key={s} size={s} iconStart={<Plus />}>
            Yeni proje · {s}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button variant="secondary" loading={saving} onClick={save}>
          Kaydet
        </Button>
        <Button
          variant="neutral"
          iconEnd={<Arrow />}
          onClick={() => setCount((c) => c + 1)}
        >
          Sayaç: {count}
        </Button>
        <Button disabled>Devre dışı</Button>
        <Button variant="ghost" disabled>
          Ghost devre dışı
        </Button>
      </div>

      <div className="max-w-sm">
        <Button size="lg" variant="accent" className="w-full plonk-tilt">
          Tam genişlik
        </Button>
      </div>
    </div>
  );
}

const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" strokeLinecap="round" />
  </svg>
);

const NOTIFICATIONS = ["E-posta", "Push", "SMS"] as const;

function FormLab() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [terms, setTerms] = useState(false);
  const [plan, setPlan] = useState<string | undefined>();
  const [channels, setChannels] = useState<string[]>(["E-posta"]);

  const emailError = !email
    ? "E-posta zorunlu"
    : !/^\S+@\S+\.\S+$/.test(email)
      ? "Geçerli bir adres yaz"
      : undefined;
  const all = channels.length === NOTIFICATIONS.length;
  const some = channels.length > 0 && !all;

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="grid content-start gap-6 self-start rounded-plonk-lg bg-plonk-surface p-6 plonk-shadow plonk-border"
      >
        <p className="font-plonk-display text-2xl">Hesap aç</p>
        <Input label="Ad" placeholder="Melih" autoComplete="off" />
        <Input
          label="E-posta"
          type="email"
          required
          placeholder="ad@ornek.com"
          description="Faturalar bu adrese gelir."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={submitted && emailError}
        />
        <RadioGroup
          label="Plan"
          required
          orientation="horizontal"
          value={plan ?? null}
          onValueChange={setPlan}
          error={submitted && !plan && "Bir plan seç"}
        >
          <Radio value="free" label="Ücretsiz" />
          <Radio value="pro" label="Pro" />
          <Radio value="team" label="Ekip" />
        </RadioGroup>
        <Checkbox
          label="Kullanım şartlarını kabul ediyorum"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
          error={submitted && !terms && "Devam etmek için gerekli"}
        />
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Gönder</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSubmitted(false);
              setEmail("");
              setTerms(false);
              setPlan(undefined);
            }}
          >
            Sıfırla
          </Button>
        </div>
      </form>

      <div className="grid content-start gap-8">
        <Input
          label="Ara"
          placeholder="Bileşen ara…"
          iconStart={<Search />}
          iconEnd={<kbd className="font-plonk-mono text-xs">⌘K</kbd>}
        />
        <Textarea
          label="Not"
          autoResize
          placeholder="Yazdıkça uzar…"
          description="autoResize açık"
        />
        <div className="grid gap-3">
          <Checkbox
            label="Tüm bildirimler"
            checked={all}
            indeterminate={some}
            onChange={() => setChannels(all ? [] : [...NOTIFICATIONS])}
          />
          <div className="grid gap-3 pl-9">
            {NOTIFICATIONS.map((c) => (
              <Checkbox
                key={c}
                label={c}
                checked={channels.includes(c)}
                onChange={(e) =>
                  setChannels((list) =>
                    e.target.checked
                      ? [...list, c]
                      : list.filter((x) => x !== c),
                  )
                }
              />
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <Switch label="Karanlık mod" description="Henüz sadece bir switch." />
          <Switch label="Otomatik kaydet" defaultChecked />
          <Switch label="Devre dışı" disabled />
        </div>
        <Input
          label="Devre dışı alan"
          value="Değiştirilemez"
          disabled
          readOnly
        />
      </div>
    </div>
  );
}

interface Invoice {
  id: string;
  customer: string;
  status: "Ödendi" | "Bekliyor" | "Gecikti";
  amount: number;
  date: Date;
}

const FIRMS = [
  "Acme",
  "Atlas",
  "Bora",
  "Çınar",
  "Deniz",
  "Ege",
  "Fırat",
  "Gökçe",
  "Hilal",
  "İpek",
  "Işık",
  "Kaan",
  "Lale",
  "Mavi",
  "Nehir",
  "Orkide",
  "Pera",
  "Rüzgar",
  "Selin",
  "Şahin",
  "Toros",
  "Umut",
  "Üstün",
  "Vadi",
  "Yaşar",
  "Zeytin",
];
const KINDS = [
  "Ltd.",
  "Lojistik",
  "Tekstil",
  "Gıda",
  "Yapı",
  "Medikal",
  "Enerji",
  "Tasarım",
  "Ajans",
  "Kafe",
];
const STATES: Invoice["status"][] = ["Ödendi", "Bekliyor", "Gecikti"];

// Tekrarlanabilir sahte veri: her yüklemede aynı 2.000 fatura.
const INVOICES: Invoice[] = Array.from({ length: 2000 }, (_, i) => ({
  id: `INV-${String(i + 1).padStart(4, "0")}`,
  customer: `${FIRMS[(i * 7) % FIRMS.length]} ${KINDS[(i * 3) % KINDS.length]}`,
  status: STATES[(i * 5 + (i >> 3)) % 3]!,
  amount: 250 + ((i * 7919) % 19750),
  date: new Date(2026, (i * 13) % 10, 1 + ((i * 11) % 28)),
}));

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});
const day = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const STATUS_VARIANT = {
  Ödendi: "success",
  Bekliyor: "warning",
  Gecikti: "danger",
} as const;

const col = createDataTableColumns<Invoice>();
const INVOICE_COLUMNS = col.columns([
  col.accessor("id", { header: "No", size: 110 }),
  col.accessor("customer", { header: "Müşteri", size: 220 }),
  col.accessor("status", {
    header: "Durum",
    size: 130,
    filterFn: "equalsString",
    meta: { filter: { type: "select" } },
    cell: (info) => (
      <Badge variant={STATUS_VARIANT[info.getValue()]}>{info.getValue()}</Badge>
    ),
  }),
  col.accessor("amount", {
    header: "Tutar",
    size: 130,
    meta: { align: "end" },
    cell: (info) => money.format(info.getValue()),
  }),
  col.accessor("date", {
    header: "Tarih",
    size: 140,
    filterFn: "inDateRange",
    enableGlobalFilter: false,
    meta: { align: "end", filter: { type: "dateRange" } },
    cell: (info) => day.format(info.getValue()),
  }),
]);

const TABLE_MESSAGES = {
  search: "Müşteri, durum ya da numara ara…",
  columns: "Sütunlar",
  all: "Tümü",
  clearFilters: "Filtreleri temizle",
  noResults: "Eşleşen fatura yok",
  loading: "Yükleniyor…",
  selected: "seçili",
  clearSelection: "Seçimi temizle",
  selectAll: "Tümünü seç",
  selectRow: "Satırı seç",
  rowCount: (shown: number, total: number) =>
    shown === total
      ? `${total.toLocaleString("tr-TR")} kayıt`
      : `${shown.toLocaleString("tr-TR")} / ${total.toLocaleString("tr-TR")} kayıt`,
};

function TableLab() {
  const [rows, setRows] = useState(INVOICES);
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <Switch
        label="Yükleniyor durumu"
        checked={loading}
        onChange={(e) => setLoading(e.target.checked)}
      />
      <DataTable
        aria-label="Faturalar"
        data={rows}
        columns={INVOICE_COLUMNS}
        getRowId={(r) => r.id}
        selectable
        isLoading={loading}
        height="30rem"
        messages={TABLE_MESSAGES}
        bulkActions={({ ids, clear }) => (
          <>
            <Button
              size="sm"
              variant="neutral"
              onPress={() => {
                const set = new Set(ids);
                setRows((all) =>
                  all.map((r) =>
                    set.has(r.id) ? { ...r, status: "Ödendi" } : r,
                  ),
                );
                toast.success(`${ids.length} fatura ödendi`, {
                  label: "Tamam",
                });
              }}
            >
              Ödendi yap
            </Button>
            <Button
              size="sm"
              variant="danger"
              onPress={() => {
                const set = new Set(ids);
                setRows((all) => all.filter((r) => !set.has(r.id)));
                clear();
              }}
            >
              Sil
            </Button>
          </>
        )}
      />
    </div>
  );
}

const CUSTOMERS = [
  "Acme Ltd.",
  "Atlas Lojistik",
  "Ayşe Yılmaz",
  "Bora Tekstil",
  "Çınar Gıda",
  "Deniz Yapı",
  "İpek Kozmetik",
  "Işık Elektrik",
];

function CommandLab({
  onPersonality,
}: {
  onPersonality: (n: PersonalityName) => void;
}) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const request = useRef(0);

  // Sahte sunucu: 600 ms sonra eşleşen müşteriler.
  const searchCustomers = (search: string) => {
    const id = ++request.current;
    if (search.trim().length < 2) {
      setLoading(false);
      setResults([]);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (id !== request.current) return;
      const q = search.toLocaleLowerCase("tr");
      setResults(
        CUSTOMERS.filter((c) => c.toLocaleLowerCase("tr").includes(q)),
      );
      setLoading(false);
    }, 600);
  };
  const done = (what: string) => () => toast.success(what, { label: "Tamam" });

  return (
    <CommandPalette
      title="Çalıştır…"
      placeholder="Ne yapmak istiyorsun?"
      emptyLabel="Sonuç yok"
      onSearchChange={searchCustomers}
    >
      <CommandGroup heading="Sayfalar">
        <CommandItem icon="📊" onAction={done("Panel açıldı")}>
          Panel
        </CommandItem>
        <CommandItem icon="🧾" onAction={done("Faturalar açıldı")}>
          Faturalar
        </CommandItem>
        <CommandItem
          icon="👥"
          keywords={["kişiler", "rehber"]}
          onAction={done("Müşteriler açıldı")}
        >
          Müşteriler
        </CommandItem>
        <CommandItem
          icon="⚙️"
          description="Hesap, ekip, faturalandırma"
          keywords={["tercihler"]}
          onAction={done("Ayarlar açıldı")}
        >
          Ayarlar
        </CommandItem>
      </CommandGroup>
      <CommandGroup heading="İşlemler">
        <CommandItem icon="➕" shortcut="⌘N" onAction={done("Yeni fatura")}>
          Yeni fatura
        </CommandItem>
        <CommandItem icon="🙋" onAction={done("Müşteri eklendi")}>
          Müşteri ekle
        </CommandItem>
        <CommandItem icon="📤" isDisabled>
          Faturaları dışa aktar
        </CommandItem>
        <CommandItem icon="🎨" page="theme">
          Tema değiştir
        </CommandItem>
      </CommandGroup>
      {(loading || results.length > 0) && (
        <CommandGroup
          heading="Müşteriler"
          filter={false}
          isLoading={loading}
          loadingLabel="Aranıyor…"
        >
          {results.map((c) => (
            <CommandItem key={c} icon="🏢" onAction={done(`${c} açıldı`)}>
              {c}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      <CommandPage id="theme">
        <CommandGroup heading="Tema">
          {PERSONALITY_NAMES.map((n) => (
            <CommandItem key={n} onAction={() => onPersonality(n)}>
              {personalities[n].label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandPage>
    </CommandPalette>
  );
}

const DENSITY = ["Çok seyrek", "Seyrek", "Normal", "Sık", "Çok sık"];

function SliderLab() {
  return (
    <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
      <Slider label="Ses" defaultValue={64} formatValue={(v) => `%${v}`} />
      <Slider
        label="Fiyat aralığı"
        defaultValue={[300, 1200]}
        min={0}
        max={2000}
        step={50}
        minGap={100}
        description="İki tutamaç arasında en az ₺100 fark kalır (minGap)."
        formatOptions={{
          style: "currency",
          currency: "TRY",
          maximumFractionDigits: 0,
        }}
        marks={[0, 500, 1000, 1500, 2000]}
        thumbLabels={["En düşük", "En yüksek"]}
      />
      <Slider
        label="Yoğunluk"
        defaultValue={3}
        min={1}
        max={5}
        formatValue={(v) => DENSITY[v - 1] ?? String(v)}
        marks={[1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) }))}
      />
      <Slider
        label="Saydamlık"
        description="Etiket sadece sürüklerken ya da odaktayken görünür."
        defaultValue={0.4}
        min={0}
        max={1}
        step={0.05}
        valueBubble="active"
        formatOptions={{ style: "percent" }}
      />
      <Slider label="Kilitli" defaultValue={30} isDisabled />
    </div>
  );
}

const PLACEMENTS: ToastPlacement[] = [
  "top-start",
  "top",
  "top-end",
  "bottom-start",
  "bottom",
  "bottom-end",
];

function ToastLab({
  placement,
  onPlacement,
}: {
  placement: ToastPlacement;
  onPlacement: (p: ToastPlacement) => void;
}) {
  const info = () =>
    toast("Taslak kaydedildi", {
      description: "Son düzenleme 2 saniye önce",
      label: "Bilgi",
    });
  const success = () =>
    toast.success("Fatura gönderildi", {
      description: "3 alıcıya ulaştı",
      label: "Tamam",
    });
  const warning = () =>
    toast.warning("Depolama %90 dolu", {
      description: "Eski dosyaları temizlemeyi düşün",
      label: "Uyarı",
    });
  const danger = () =>
    toast.danger("Yükleme başarısız", {
      description: "Bağlantı koptu",
      label: "Hata",
      action: {
        label: "Tekrar dene",
        onPress: () =>
          toast("Tekrar deneniyor…", {
            description: "Dosya 2/3 yükleniyor",
            label: "Bilgi",
          }),
      },
    });
  const undo = () =>
    toast("Proje silindi", {
      description: "“Q4 raporu” çöp kutusuna taşındı",
      label: "Bilgi",
      action: {
        label: "Geri al",
        onPress: () => toast.success("Proje geri yüklendi", { label: "Tamam" }),
      },
    });
  const rain = () =>
    [info, success, warning, danger, undo].forEach((fn, i) =>
      setTimeout(fn, i * 150),
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="neutral" onPress={info}>
          Bilgi
        </Button>
        <Button variant="secondary" onPress={success}>
          Başarılı
        </Button>
        <Button variant="accent" onPress={warning}>
          Uyarı
        </Button>
        <Button variant="danger" onPress={danger}>
          Hata + aksiyon
        </Button>
        <Button variant="neutral" onPress={undo}>
          Geri al (süresiz)
        </Button>
        <Button
          variant="neutral"
          onPress={() =>
            toast("Bantsız sticker", {
              description: "toast(…, { tape: false })",
              label: "Bilgi",
              tape: false,
            })
          }
        >
          Bantsız
        </Button>
        <Button variant="primary" onPress={rain}>
          5’li yağmur
        </Button>
        <Button variant="ghost" onPress={() => toast.dismiss()}>
          Hepsini kapat
        </Button>
      </div>
      <div className="w-64">
        <Select
          label="Konum"
          selectedKey={placement}
          onSelectionChange={(k) => onPlacement(k as ToastPlacement)}
        >
          {PLACEMENTS.map((p) => (
            <SelectItem key={p} id={p}>
              {p}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}

const TZ = getLocalTimeZone();
const isSunday = (date: DateValue) => date.toDate(TZ).getDay() === 0;

const PRESETS: CalendarPreset[] = [
  {
    label: "Son 7 gün",
    range: () => ({ start: today(TZ).subtract({ days: 6 }), end: today(TZ) }),
  },
  {
    label: "Bu ay",
    range: () => {
      const first = today(TZ).set({ day: 1 });
      return {
        start: first,
        end: first.add({ months: 1 }).subtract({ days: 1 }),
      };
    },
  },
  {
    label: "Geçen ay",
    range: () => {
      const first = today(TZ).set({ day: 1 }).subtract({ months: 1 });
      return {
        start: first,
        end: first.add({ months: 1 }).subtract({ days: 1 }),
      };
    },
  },
];

const subscribeNothing = () => () => {};

function DateLab() {
  // "Bugün" sunucuda ön-render sırasında sabitlenmesin (Next 16 Cache
  // Components): tarihli örnekler sadece tarayıcıda çizilir.
  const isClient = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  if (!isClient) return <div className="h-96" />;
  return (
    <div className="flex flex-col gap-10">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DatePicker
          label="Teslim tarihi"
          description="Bugünden önce olamaz."
          minValue={today(TZ)}
          isDateUnavailable={isSunday}
        />
        <DateRangePicker
          label="Rapor aralığı"
          presets={PRESETS}
          isDateUnavailable={isSunday}
        />
        <DatePicker
          label="Hatalı örnek"
          defaultValue={today(TZ).subtract({ days: 3 })}
          minValue={today(TZ)}
          error="Geçmiş bir tarih seçilemez."
        />
      </div>
      <div className="flex flex-wrap items-start gap-10 pt-4">
        <Calendar aria-label="Takvim" defaultValue={today(TZ)} />
        <RangeCalendar
          aria-label="Aralık takvimi"
          presets={PRESETS}
          isDateUnavailable={isSunday}
        />
      </div>
    </div>
  );
}

function DialogLab() {
  const [name, setName] = useState("Melih Fidan");
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <DialogTrigger>
        <Button>Profili düzenle</Button>
        <Dialog
          title="Profili düzenle"
          description="Değişiklikler tüm ekip üyelerine görünür."
          closeLabel="Kapat"
          footer={({ close }) => (
            <>
              <Button variant="ghost" onPress={close}>
                Vazgeç
              </Button>
              <Button onPress={close}>Kaydet</Button>
            </>
          )}
        >
          <div className="grid gap-5">
            <Input
              label="Ad"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Switch label="Profilim herkese açık" defaultChecked />
          </div>
        </Dialog>
      </DialogTrigger>

      <DialogTrigger>
        <Button variant="danger">Projeyi sil</Button>
        <Dialog
          role="alertdialog"
          size="sm"
          title="Proje silinsin mi?"
          description="“Plonk docs” ve içindeki 24 sayfa kalıcı olarak silinecek."
          footer={({ close }) => (
            <>
              <Button variant="neutral" onPress={close} autoFocus>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                onPress={() => {
                  setDeleted(true);
                  close();
                }}
              >
                Sil
              </Button>
            </>
          )}
        />
      </DialogTrigger>

      <DialogTrigger>
        <Button variant="neutral">Uzun içerik</Button>
        <Dialog title="Kullanım şartları" size="lg" closeLabel="Kapat">
          <div className="grid gap-4">
            {Array.from({ length: 14 }, (_, i) => (
              <p key={i}>
                {i + 1}. Plonk bir portfolyo projesidir. Bileşenler olduğu gibi
                sunulur; aktif destek verilmez ama katkılar her zaman
                memnuniyetle karşılanır.
              </p>
            ))}
          </div>
        </Dialog>
      </DialogTrigger>

      {deleted && (
        <Badge variant="danger" dot>
          Proje silindi
        </Badge>
      )}
    </div>
  );
}

function StructureLab() {
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <Tabs>
        <TabList aria-label="Proje ayarları">
          <Tab id="general">Genel</Tab>
          <Tab id="team">Ekip üyeleri</Tab>
          <Tab id="billing" isDisabled>
            Fatura
          </Tab>
          <Tab id="security">Güvenlik</Tab>
        </TabList>
        <TabPanel id="general">
          <Card title="Genel">
            <div className="grid gap-4">
              <Input label="Proje adı" defaultValue="Plonk docs" />
              <Switch label="Herkese açık" defaultChecked />
            </div>
          </Card>
        </TabPanel>
        <TabPanel id="team">
          <Card
            title="Ekip üyeleri"
            actions={<Badge variant="secondary">6</Badge>}
          >
            <AvatarGroup max={5} aria-label="Ekip">
              {TEAM.map((n) => (
                <Avatar key={n} name={n} />
              ))}
            </AvatarGroup>
          </Card>
        </TabPanel>
        <TabPanel id="billing">Fatura</TabPanel>
        <TabPanel id="security">
          <Card title="Güvenlik">
            <Checkbox label="İki adımlı doğrulama" defaultChecked />
          </Card>
        </TabPanel>
      </Tabs>

      <Accordion defaultExpandedKeys={["free"]}>
        <AccordionItem id="free" title="Plonk ücretli mi?">
          Hayır. Açık kaynak ve ücretsiz; bir portfolyo projesi olduğu için
          aktif destek verilmiyor.
        </AccordionItem>
        <AccordionItem id="personalities" title="Kaç kişilik var?">
          Şimdilik iki: Sticker ve Eski Bilgisayar. Çizgi Roman ve Atari Salonu
          sırada.
        </AccordionItem>
        <AccordionItem id="fonts" title="Kendi fontumu kullanabilir miyim?">
          Evet. --plonk-font-display ve --plonk-font-body token&apos;larını
          değiştirmen yeterli; bizim fontlar o zaman hiç indirilmez.
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const CITIES = [
  "Adana",
  "Ankara",
  "Antalya",
  "Bursa",
  "Diyarbakır",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "İstanbul",
  "İzmir",
  "Kayseri",
  "Konya",
  "Muğla",
  "Samsun",
  "Şanlıurfa",
  "Trabzon",
];

const Icon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

function SelectionLab() {
  const [last, setLast] = useState<string>("—");
  const [plan, setPlan] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="grid content-start justify-items-start gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <MenuTrigger>
            <Button variant="neutral" iconEnd={<Icon d="m6 9 6 6 6-6" />}>
              Eylemler
            </Button>
            <Menu onAction={(key) => setLast(String(key))}>
              <MenuSection title="Proje">
                <MenuItem
                  id="Düzenle"
                  icon={<Icon d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z" />}
                  shortcut="⌘E"
                >
                  Düzenle
                </MenuItem>
                <MenuItem
                  id="Kopyala"
                  icon={<Icon d="M8 8h12v12H8zM4 16V4h12" />}
                  shortcut="⌘D"
                  description="Ayarlarla birlikte"
                >
                  Kopyasını oluştur
                </MenuItem>
                <MenuItem
                  id="Arşivle"
                  icon={<Icon d="M4 7h16v13H4zM2 3h20v4H2zM10 12h4" />}
                  isDisabled
                >
                  Arşivle
                </MenuItem>
              </MenuSection>
              <MenuSeparator />
              <MenuItem
                id="Sil"
                variant="danger"
                icon={
                  <Icon d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                }
                shortcut="⌫"
              >
                Sil
              </MenuItem>
            </Menu>
          </MenuTrigger>
          <span className="text-sm text-plonk-ink-muted">
            Son eylem: <b className="text-plonk-ink">{last}</b>
          </span>
        </div>

        <MenuTrigger>
          <Button variant="ghost">Görünüm (seçimli menü)</Button>
          <Menu selectionMode="single" defaultSelectedKeys={["grid"]}>
            <MenuItem id="list">Liste</MenuItem>
            <MenuItem id="grid">Izgara</MenuItem>
            <MenuItem id="board">Pano</MenuItem>
          </Menu>
        </MenuTrigger>
      </div>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="grid content-start gap-6"
      >
        <Select
          label="Plan"
          placeholder="Bir plan seç"
          isRequired
          selectedKey={plan}
          onSelectionChange={(key) => setPlan(key == null ? null : String(key))}
          error={submitted && !plan && "Bir plan seçmelisin"}
        >
          <SelectItem id="free" description="1 proje, 3 üye">
            Ücretsiz
          </SelectItem>
          <SelectItem id="pro" description="Sınırsız proje, 10 üye">
            Pro
          </SelectItem>
          <SelectItem id="team" description="Her şey sınırsız">
            Ekip
          </SelectItem>
        </Select>
        <ComboBox
          label="Şehir"
          placeholder="Yazmaya başla…"
          description="81 il yerine örnek bir liste"
          emptyMessage="Bu isimde bir şehir yok"
        >
          {CITIES.map((c) => (
            <ComboBoxItem key={c} id={c}>
              {c}
            </ComboBoxItem>
          ))}
        </ComboBox>
        <div>
          <Button type="submit">Devam</Button>
        </div>
      </form>
    </div>
  );
}

const ICONS = {
  Kalın: "M7 5h6a3.5 3.5 0 0 1 0 7H7zm0 7h7a3.5 3.5 0 0 1 0 7H7z",
  İtalik: "M10 5h8M6 19h8M14 5l-4 14",
  Bağlantı:
    "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
} as const;

function LayersLab() {
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-4">
        {(["right", "left", "bottom"] as const).map((placement) => (
          <DialogTrigger key={placement}>
            <Button variant="neutral">Drawer · {placement}</Button>
            <Drawer
              placement={placement}
              title="Filtreler"
              description="Sonuçları daralt."
              closeLabel="Kapat"
              footer={({ close }) => (
                <>
                  <Button variant="ghost" onPress={close}>
                    Temizle
                  </Button>
                  <Button onPress={close}>Uygula</Button>
                </>
              )}
            >
              <div className="grid gap-5">
                <Input label="Ara" placeholder="Proje adı…" />
                <RadioGroup label="Durum" defaultValue="all">
                  <Radio value="all" label="Hepsi" />
                  <Radio value="active" label="Aktif" />
                  <Radio value="archived" label="Arşivlenmiş" />
                </RadioGroup>
                <Switch label="Sadece benimkiler" />
              </div>
            </Drawer>
          </DialogTrigger>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <DialogTrigger>
          <Button variant="secondary">Paylaş</Button>
          <Popover title="Bağlantıyı paylaş">
            {({ close }) => (
              <div className="grid gap-3">
                <Input
                  aria-label="Bağlantı"
                  defaultValue="plonk.dev/s/a8f3"
                  readOnly
                />
                <Button size="sm" onPress={close}>
                  Kopyala
                </Button>
              </div>
            )}
          </Popover>
        </DialogTrigger>
        <DialogTrigger>
          <Button variant="accent">Bilgi</Button>
          <Popover placement="top" aria-label="Plan bilgisi">
            <p className="text-sm">
              Pro planda 10 ekip üyesi ve sınırsız proje var.
            </p>
          </Popover>
        </DialogTrigger>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(ICONS).map(([label, d]) => (
          <TooltipTrigger key={label}>
            <Button variant="neutral" size="sm" aria-label={label}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d={d} />
              </svg>
            </Button>
            <Tooltip>{label}</Tooltip>
          </TooltipTrigger>
        ))}
        <TooltipTrigger>
          <Button variant="ghost" size="sm">
            Kısayol
          </Button>
          <Tooltip placement="bottom">Komut paletini aç: ⌘K</Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  );
}

// Örnek profil resmi: dışarıdan resim çekmemek için satır içi SVG.
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#5FBFFF"/><circle cx="20" cy="16" r="7" fill="#1F1A17"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13" fill="#1F1A17"/></svg>',
)}`;

const TEAM = [
  "Melih Fidan",
  "Ayşe Yılmaz",
  "Can Demir",
  "Deniz Kaya",
  "Ece Su",
  "Ferit Oral",
];

function DisplayLab() {
  const [progress, setProgress] = useState(35);
  const [open, setOpen] = useState(true);
  const [tape, setTape] = useState(true);

  return (
    <div className="grid gap-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card
          title="Aylık gelir"
          actions={
            <Badge variant="success" dot>
              +12%
            </Badge>
          }
        >
          <p className="font-plonk-display text-4xl">₺48.250</p>
          <p className="mt-1 text-sm text-plonk-ink-muted">Geçen ay ₺43.080</p>
        </Card>

        <Card
          title="Sprint 14"
          description="Bitmesine 3 gün"
          tape={tape}
          tilt="right"
          footer={
            <AvatarGroup max={3} size="sm" aria-label="Ekip">
              {TEAM.map((n) => (
                <Avatar key={n} name={n} />
              ))}
            </AvatarGroup>
          }
        >
          <Progress label="Tamamlanan" value={68} showValue variant="success" />
        </Card>

        {open ? (
          <Card
            title="Yeni sürüm"
            onClose={() => setOpen(false)}
            closeLabel="Kapat"
            footer={
              <>
                <Button size="sm">Güncelle</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                >
                  Sonra
                </Button>
              </>
            }
          >
            <p className="text-sm">
              Plonk 0.2 hazır. Değişiklikleri görmek için güncelle.
            </p>
          </Card>
        ) : (
          <Button variant="neutral" onClick={() => setOpen(true)}>
            Kartı geri getir
          </Button>
        )}
      </div>

      <Switch
        label="Sprint kartında bant"
        description="tape seçeneği: varsayılan kapalı, kullanan seçer. Retro'da görünmez."
        checked={tape}
        onChange={(e) => setTape(e.target.checked)}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Badge>Taslak</Badge>
        <Badge variant="primary">Yeni</Badge>
        <Badge variant="secondary">Beta</Badge>
        <Badge variant="accent">Öne çıkan</Badge>
        <Badge variant="success" dot>
          Aktif
        </Badge>
        <Badge variant="warning" dot>
          Beklemede
        </Badge>
        <Badge variant="danger" dot>
          Hata
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-end gap-3">
          <Avatar name="Melih Fidan" src={PHOTO} size="lg" />
          <Avatar name="Ayşe Yılmaz" size="lg" />
          <Avatar name="Bozuk Resim" src="/yok.png" size="lg" />
        </div>
        <AvatarGroup max={4} aria-label="Ekip">
          {TEAM.map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </AvatarGroup>
      </div>

      <div className="grid max-w-xl gap-6">
        <Progress label="Yükleme" value={progress} showValue />
        <div className="flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="neutral"
            onClick={() => setProgress((v) => Math.max(0, v - 20))}
          >
            −20
          </Button>
          <Button
            size="sm"
            variant="neutral"
            onClick={() => setProgress((v) => Math.min(100, v + 20))}
          >
            +20
          </Button>
        </div>
        <Progress label="Bekleniyor (belirsiz)" variant="secondary" />
      </div>

      <p className="flex flex-wrap items-center gap-2 text-plonk-ink-muted">
        Komut paleti: <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> · Kaydet: <Kbd>Ctrl</Kbd>
        <Kbd>S</Kbd>
      </p>
    </div>
  );
}

function MotionCard({
  token,
  personality,
  reduce,
}: {
  token: MotionToken;
  personality: PersonalityName;
  reduce: boolean;
}) {
  const [on, setOn] = useState(false);
  const easing = personalities[personality].motion[token];
  const { duration } = resolveEasing(easing);
  const points = sampleEasing(easing, 100);
  const peak = Math.max(1.2, overshoot(easing) + 0.05);
  const W = 220;
  const H = 110;
  const path = points
    .map(
      ([t, v], i) =>
        `${i ? "L" : "M"}${(t * W).toFixed(1)},${(H - (v / peak) * H).toFixed(1)}`,
    )
    .join(" ");
  const target = H - H / peak;

  return (
    <div className="rounded-plonk-md bg-plonk-surface p-5 plonk-shadow plonk-border">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-plonk-display text-2xl">{token}</p>
        <p className="font-plonk-mono text-xs text-plonk-ink-muted">
          {easing.type} · {duration}ms
        </p>
      </div>
      <p className="mt-1 min-h-10 text-sm text-plonk-ink-muted">
        {MOTION_TOKENS[token]}
      </p>

      <svg
        viewBox={`-4 -4 ${W + 8} ${H + 8}`}
        className="mt-3 w-full"
        aria-hidden="true"
      >
        <line
          x1={0}
          x2={W}
          y1={target}
          y2={target}
          stroke="currentColor"
          strokeDasharray="4 4"
          opacity={0.3}
        />
        <line x1={0} x2={W} y1={H} y2={H} stroke="currentColor" opacity={0.2} />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />
      </svg>

      <div className="relative mt-4 h-10 rounded-plonk-pill bg-plonk-canvas">
        <span
          className={cn(
            "absolute top-1 left-1 size-8 rounded-plonk-pill bg-plonk-primary [transition-property:translate] plonk-border",
            MOTION_CLASS[token],
          )}
          style={{ translate: on ? "9rem 0" : "0 0" }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setOn(!on)}
          className="plonk-pressable rounded-plonk-sm bg-plonk-primary px-4 py-1.5 text-sm font-bold text-plonk-on-primary plonk-border"
        >
          Oynat
        </button>
        {reduce && token !== "press" && (
          <span className="text-xs text-plonk-ink-muted">
            azaltılmış: 150ms
          </span>
        )}
      </div>
    </div>
  );
}
