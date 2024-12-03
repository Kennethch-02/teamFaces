import Logo from "../../assets/logo";

export const MobileHeader = () => {
    return (
      <div className="relative -mt-16 block lg:hidden">
        <a
          className="inline-flex size-16 items-center justify-center rounded-full bg-white text-blue-600 sm:size-20 dark:bg-gray-900"
          href="#"
        >
          <span className="sr-only">Home</span>
          <Logo className="h-8 sm:h-10" />
        </a>
  
        <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white">
          Welcome to Squid 🦑
        </h1>
  
        <p className="mt-4 leading-relaxed text-gray-500 dark:text-gray-400">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eligendi nam dolorum aliquam, quibusdam aperiam voluptatum.
        </p>
      </div>
    );
  };
  