import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_35%),linear-gradient(135deg,_#030712_0%,_#0f172a_100%)] px-6 py-10 text-zinc-100">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center">
        <div className="rounded-3xl border border-emerald-500/20 bg-zinc-950/80 p-8 shadow-2xl shadow-emerald-950/40 backdrop-blur xl:p-12">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-emerald-400">
            termux online studio
          </p>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Працюй як у терміналі, створюй код і отримуй AI-підказки прямо в браузері.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
            Створи файл, відредагуй код, дивись вивід у консолі і проси AI допомогти з рефакторингом або генерацією шаблонів.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/editor"
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Відкрити редактор
            </Link>
            <Link
              href="/projects"
              className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-900"
            >
              Проєкти
            </Link>
            <Link
              href="/console"
              className="rounded-xl border border-emerald-700/40 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-950/40"
            >
              Консоль
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Termux-like UI"
              description="Терміральний стиль, темна тема, панелі та швидкий доступ до інструментів."
            />
            <FeatureCard
              title="Редактор коду"
              description="Створюй, змінюй та зберігай файли прямо в браузері."
            />
            <FeatureCard
              title="Вбудований AI"
              description="Отримуй пояснення, рефакторинг і шаблони без виходу з робочого простору."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg shadow-black/30">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
    </div>
  );
}
