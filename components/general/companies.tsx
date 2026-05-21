import { LogoCloud } from "./logo-cloude";

const Companies = () => {
  return (
    <div className="w-full place-content-center">
      <section className="relative mx-auto max-w-7xl w-full">
        <h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-3xl">
          <span className="text-muted-foreground">Built by these tools.</span>
        </h2>
        <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mx-auto my-5 h-px max-w-4xl bg-border" />
        <LogoCloud />
        <div className="mask-[linear-gradient(to_right,transparent,black,transparent)] mt-5 h-px bg-border" />
      </section>
    </div>
  );
};

export default Companies;
