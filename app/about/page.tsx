import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";

export const metadata: Metadata = {
  title: "About",
  description:
    "Fronk Kunanon Jarat — founder, builder, and writer. The short version of who I am and how I work.",
};

export default function AboutPage() {
  return (
    <Container size="lg" className="py-20">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-widest text-muted">About</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Founder, builder, writer.
        </h1>
      </header>

      <Prose>
        <p>
          I'm Fronk Kunanon Jarat. I start companies — usually around
          infrastructure, devtools, and the unglamorous plumbing that lets small
          teams ship like big ones.
        </p>

        <p>
          My background is technical: I started writing code before I knew what
          a customer was, spent a long stretch on systems work, and slowly
          discovered that the harder problem was almost always organizational,
          not algorithmic. Most of what I do now is some combination of design
          partner conversations, hiring, and unblocking the engineers on my team
          before lunch.
        </p>

        <h2>How I work</h2>
        <p>
          A few defaults that have held up across companies and decades:
        </p>
        <ul>
          <li>
            <strong>Ship the smallest thing that proves the bet.</strong>{" "}
            Pre-revenue founders confuse motion with progress; the cure is
            shrinking the next milestone until it scares you.
          </li>
          <li>
            <strong>Hire writers.</strong> The bar I look for is "can you write
            a clear paragraph about a thing you don't fully understand yet?"
            Everything else can be taught.
          </li>
          <li>
            <strong>Stay close to the work.</strong> CEOs who haven't touched
            the product in six months can't make good calls. I review code, sit
            in support, and ship at least one PR a month.
          </li>
          <li>
            <strong>Optimize for reversibility.</strong> Most R1 decisions get
            framed as R0. Cheap to try, cheap to undo, expensive to defer — in
            that order.
          </li>
        </ul>

        <h2>What I'm doing now</h2>
        <p>
          Currently focused on <Link href="/ventures/atlas">Atlas</Link>, an
          infrastructure platform for small engineering teams. Writing weekly
          about what I'm learning in the <Link href="/writing">journal</Link>.
          Always open to talking to founders, builders, and the occasional
          reformed consultant. <Link href="/contact">Say hello</Link>.
        </p>
      </Prose>
    </Container>
  );
}
