export const Button = ({ children, variant = "primary", className = "", ...props }) => {
    const baseStyles = "inline-block shrink-0 rounded-md px-12 py-3 text-sm font-medium transition focus:outline-none focus:ring";
    const variants = {
      primary: "border border-blue-600 bg-blue-600 text-white hover:bg-transparent hover:text-blue-600 dark:hover:bg-blue-700 dark:hover:text-white",
    };
  
    return (
      <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  };