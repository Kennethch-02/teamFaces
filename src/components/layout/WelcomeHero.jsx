import Logo from "../../assets/logo";

export const WelcomeHero = () => {
    return (
      <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
  
        <div className="hidden lg:relative lg:block lg:p-12">
          <a className="block text-white" href="#">
            <span className="sr-only">Home</span>
            <Logo className="h-8 sm:h-10" />
          </a>
  
          <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
            Welcome to Squid 🦑
          </h2>
  
          <p className="mt-4 leading-relaxed text-white/90">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi
            nam dolorum aliquam, quibusdam aperiam voluptatum.
          </p>
        </div>
      </section>
    );
  };