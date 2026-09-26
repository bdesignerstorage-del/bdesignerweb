import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";
import Hero from "@/components/home/Hero";
import Reveal from "@/components/home/Reveal";
import HorizontalScroll from "@/components/HorizontalScroll";
import TrustIndicators from "@/components/home/TrustIndicators";
import ConstructionProcess from "@/components/home/ConstructionProcess";
import GuaranteesYouDeserve from "@/components/home/GuaranteesYouDeserve";
import AvailableInBengaluru from "@/components/home/AvailableInBengaluru";
import HomeownerReviews from "@/components/home/HomeownerReviews";
import WhyChooseBDesigner from "@/components/home/WhyChooseBDesigner";
import FAQ from "@/components/home/FAQ";
import HomeSkeleton from "@/components/home/HomeSkeleton";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [sections, setSections] = useState({
    trust_indicator: [],
    construction_step: [],
    guarantee: [],
    advisor_benefit: [],
    service_area: [],
    service_area_region: [],
    homeowner_review: [],
    construction_package: [],
    comparison_feature: [],
    faq: [],
  });

  useEffect(() => {
    // Each call degrades gracefully so a single 5xx/network blip
    // doesn't show the React dev-overlay "Network Error" banner.
    const safe = (p, fallback) => p.then((r) => r.data).catch(() => fallback);
    const params = new URLSearchParams(window.location.search);
    const wantsPreview = params.get("cms_preview") === "1";
    const hasAdminToken = !!(sessionStorage.getItem("bd_token") || localStorage.getItem("bd_token"));
    const sectionsReq = (wantsPreview && hasAdminToken)
      ? safe(api.get("/admin/cms/homepage/preview"), null).then((d) => (d && d.sections) ? d.sections : null)
      : Promise.resolve(null);
    Promise.all([
      safe(api.get("/projects?limit=8"), []),
      sectionsReq,
      safe(api.get("/homepage/sections"), {
        trust_indicator: [], construction_step: [], guarantee: [], advisor_benefit: [],
        service_area: [], service_area_region: [], homeowner_review: [], construction_package: [],
        comparison_feature: [], faq: [],
      }),
    ]).then(([p, previewSections, hp]) => {
      setProjects(p);
      setSections(previewSections || hp || {});
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // While the initial homepage payload is loading, swap in lightweight
  // skeleton placeholders so the user sees the page silhouette
  // immediately — no jarring blank screen.
  if (loading) {
    return (
      <div data-testid="home-page-loading">
        <HomeSkeleton />
      </div>
    );
  }

  return (
    <div data-testid="home-page">
      {/* HERO — fixed full-viewport architectural photograph (image-only).
          The content below scrolls up over it (cinematic reveal). */}
      <Hero />

      {/* Content scrolls over the ONE clean fixed background. The dark glass
          lives HERE (on the content) so it moves with the content, while the
          empty hero area above stays clean. */}
      <div className="relative z-10 bd-content-glass" data-testid="home-content">

      {/* Breathing room so the first cards don't feel attached to the hero image */}
      <div className="h-8 sm:h-12 lg:h-16" aria-hidden="true" data-testid="home-top-spacer" />

      {/* Trust Indicators — admin-managed horizontal scroll cards */}
      <Reveal><TrustIndicators items={sections.trust_indicator || []} /></Reveal>

      {/* Construction Process — horizontal architectural timeline */}
      <Reveal><ConstructionProcess items={sections.construction_step || []} /></Reveal>

      {/* Available in Bengaluru — map + service area chips */}
      <Reveal><AvailableInBengaluru items={sections.service_area || []} /></Reveal>

      {/* Guarantees You Deserve — vertical menu + animated right panel */}
      <Reveal><GuaranteesYouDeserve items={sections.guarantee || []} settings={(sections._settings || {}).guarantee} /></Reveal>

      {/* Why Choose BDesigner — comparison table */}
      <Reveal><WhyChooseBDesigner items={sections.comparison_feature || []} settings={(sections._settings || {}).comparison_feature} /></Reveal>

      {/* Trending Projects — horizontal scroll */}
      <Reveal>
      <HorizontalScroll
        eyebrow="Completed Projects"
        title="Trending Projects"
        link="/projects"
        linkLabel="Browse all"
        testid="recent-projects-section"
      >
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} compact />
        ))}
      </HorizontalScroll>
      </Reveal>

      {/* Homeowner Reviews carousel (no photos) */}
      <Reveal><HomeownerReviews items={sections.homeowner_review || []} /></Reveal>

      {/* FAQ accordion */}
      <Reveal><FAQ items={sections.faq || []} /></Reveal>

      </div>{/* /home-content */}
    </div>
  );
}
