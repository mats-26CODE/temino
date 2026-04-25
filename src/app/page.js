export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold">Next.js</h1>

      <p className="mt-4 text-center text-lg text-gray-300">
        To get started, edit the <code>page.js</code> file.
      </p>

      <div className="mt-6 flex gap-4">
        <a
          href="https://nextjs.org/docs"
          target="_blank"
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          Documentation
        </a>

        <a
          href="https://nextjs.org/templates"
          target="_blank"
          className="rounded-lg border border-gray-700 px-4 py-2 hover:bg-gray-800"
        >
          Templates
        </a>
      </div>
    </main>
  );
}