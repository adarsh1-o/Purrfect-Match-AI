export default function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-800 bg-neutral-950 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <span>Purrfect Match<span className="text-red-500">.ai</span></span>
            </div>
            <p className="mt-3 text-sm text-neutral-400 max-w-md">
              An AI-powered behavioral intelligence platform that helps people adopt cats based on personality rather than appearance, and continues supporting them throughout their companionship journey.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2 md:text-right border-l md:border-l-0 md:border-r border-neutral-800 pl-4 md:pl-0 md:pr-4">
            <span className="text-xs font-semibold uppercase text-red-500 tracking-wider">Mission Statement</span>
            <p className="italic text-sm text-neutral-300">
              "People adopt cats based on appearance. We help them adopt based on personality. Most platforms stop at adoption; we support the entire companionship journey to build a lifelong bond."
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>© {new Date().getFullYear()} Kizuna Paws (Ananya Kota & Nakka Adarsh). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
