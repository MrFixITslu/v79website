import React, { useEffect } from "react";
import { ArrowLeft, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { V79OfficialLogo } from "./V79OfficialLogo";

export type LegalDocumentType = "privacy" | "terms" | "data-deletion";

interface LegalPageProps {
  type: LegalDocumentType;
}

const EFFECTIVE_DATE = "6 October 2026";

const External = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-v79-teal dark:text-v79-teal-light underline underline-offset-2 hover:opacity-80"
  >
    {children}
    <ExternalLink className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" />
  </a>
);

const Section = ({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) => (
  <section id={id} className="scroll-mt-28 space-y-3 border-t border-app-border pt-7 first:border-t-0 first:pt-0">
    <h2 className="text-xl font-bold text-app-text dark:text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-7 text-app-text-sec">{children}</div>
  </section>
);

const BulletList = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-v79-teal">{children}</ul>
);

function PrivacyPolicy() {
  return (
    <>
      <Section title="1. Scope of this Privacy Policy">
        <p>
          This Privacy Policy explains how V79 Digital ("V79", "we", "us", or "our") collects, uses,
          stores, shares, and protects personal information when you use v79sl.com and V79-branded
          products or services that link to this policy. These may include V79 Hub, V79 Marketing,
          V79Tiquet, FFPRO, V79 POS, V79 Academy, and related business services. A specific product or
          customer agreement may provide additional privacy terms; where it does, those additional
          terms apply to that product or engagement.
        </p>
        <p>
          V79 Digital operates from Saint Lucia and seeks to handle personal information consistently
          with applicable Saint Lucia privacy and data-protection law, including the Data Protection
          Act 2011 as amended and commenced, and with contractual privacy requirements imposed by the
          technology providers we integrate with.
        </p>
      </Section>

      <Section title="2. Information we may collect">
        <p>The information we process depends on which V79 service you use. It may include:</p>
        <BulletList>
          <li><strong>Account and identity information:</strong> name, email address, phone number, organisation, role, workspace or user identifiers, and authentication/session information.</li>
          <li><strong>Business and contact information:</strong> company details, service requests, employee-size band, business challenges, messages, enquiries, support tickets, CRM records, and communication history.</li>
          <li><strong>Product and workspace data:</strong> information you enter into the V79 applications you choose to use, including business content, campaigns, tasks, course progress, support records, or other application-specific information.</li>
          <li><strong>Social and third-party connection information:</strong> provider account or channel identifiers, account names, granted OAuth scopes, encrypted access or refresh tokens, and content you choose to schedule or publish.</li>
          <li><strong>Website and technical information:</strong> IP address, browser/device information, security and diagnostic logs, page or route information, and fraud/abuse signals.</li>
          <li><strong>Learning information:</strong> where V79 Academy is used, enrolment, course progress, notes, assessment results, certificates, and related learner information.</li>
        </BulletList>
        <p>
          We do not ask for or store your Google, YouTube, LinkedIn, TikTok, Meta, or other third-party
          account password. Those providers authenticate you directly through their own OAuth or
          authorisation flows.
        </p>
      </Section>

      <Section title="3. How we use information">
        <p>We may use personal information to:</p>
        <BulletList>
          <li>provide, secure, operate, maintain, and improve V79 services;</li>
          <li>authenticate users and enforce workspace and role permissions;</li>
          <li>respond to enquiries, support requests, appointments, and customer communications;</li>
          <li>deliver requested integrations, including social-media or business-profile publishing;</li>
          <li>generate, schedule, publish, or analyse content when you explicitly request those functions;</li>
          <li>manage subscriptions, service entitlements, support relationships, and business records;</li>
          <li>detect misuse, fraud, security incidents, and operational faults;</li>
          <li>meet legal, contractual, accounting, compliance, and provider-policy obligations; and</li>
          <li>send service communications and, where permitted, marketing communications that you can opt out of.</li>
        </BulletList>
        <p>
          We do not sell personal information. We do not use authorised Google/YouTube, LinkedIn,
          TikTok, Meta, or similar provider data for behavioural advertising or unrelated profiling.
        </p>
      </Section>

      <Section title="4. Google and YouTube API Services" id="youtube">
        <p>
          V79 Marketing may use Google APIs and YouTube API Services when you choose to connect a
          Google or YouTube account. Depending on the features you authorise, V79 may access a YouTube
          channel identifier, channel title or handle, granted permissions, OAuth tokens, and the
          content or metadata you direct V79 to upload or publish. V79 uses this information only to
          provide the connected features you request, such as identifying the authorised channel and
          uploading videos.
        </p>
        <p>
          Use of YouTube features is also subject to the{" "}
          <External href="https://www.youtube.com/t/terms">YouTube Terms of Service</External>. Google
          explains its own data practices in the{" "}
          <External href="https://policies.google.com/privacy">Google Privacy Policy</External>.
        </p>
        <p>
          You can revoke V79's Google/YouTube access through the V79 connection controls and through
          your{" "}
          <External href="https://security.google.com/settings/security/permissions">
            Google security permissions
          </External>. When a connection is revoked or deleted, V79 removes stored provider
          authorisation credentials and provider connection data in accordance with applicable
          provider requirements. You may also contact us to request deletion of stored data associated
          with your connected account. Where YouTube's developer policies impose a shorter deletion or
          refresh period, we apply that provider-specific period.
        </p>
      </Section>

      <Section title="5. LinkedIn, TikTok, Meta and other connected services">
        <p>
          If you connect LinkedIn, TikTok, Facebook, Instagram, Google Business Profile, YouTube, or
          another supported third-party service, you authorise V79 to perform only the actions covered
          by the permissions you approve. This may include identifying an account or page, preparing
          content, publishing content, or reading limited information necessary to operate the
          integration.
        </p>
        <p>
          Third-party services remain governed by their own terms and privacy policies. Their
          availability, review requirements, quotas, permissions, and data practices are controlled by
          those providers, not by V79.
        </p>
      </Section>

      <Section title="6. AI-assisted features">
        <p>
          Some V79 products include AI-assisted functions. Depending on configuration, prompts and
          relevant business context may be processed by locally hosted models such as Ollama or by an
          external AI provider that has been explicitly configured for the service. We aim to minimise
          the information sent to AI services and to avoid sending secrets or unrelated personal data.
          AI-generated material should be reviewed by a person before it is relied upon or published.
        </p>
      </Section>

      <Section title="7. Cookies, local storage and similar technology">
        <p>
          V79 services may use essential cookies or browser storage for authentication, security,
          session continuity, interface preferences such as theme selection, and fraud prevention.
          The public website may use Google reCAPTCHA when configured to protect forms from abuse;
          Google's own technologies and privacy terms apply to that service.
        </p>
        <p>
          We do not currently use the public V79 website to place third-party behavioural advertising
          cookies. If that changes, this policy and any required consent controls will be updated
          before the new use is enabled.
        </p>
      </Section>

      <Section title="8. When we share information">
        <p>We may disclose information only as reasonably necessary to:</p>
        <BulletList>
          <li>technology providers that process data to deliver a feature you requested;</li>
          <li>V79 applications participating in an authorised workflow, such as Hub, Tiquet, or Marketing;</li>
          <li>contractors or service providers operating under appropriate confidentiality and security obligations;</li>
          <li>comply with law, lawful process, regulatory requirements, or protect rights, safety, security, and service integrity; or</li>
          <li>complete a business transfer, restructuring, or similar transaction subject to applicable safeguards.</li>
        </BulletList>
        <p>
          We do not provide advertisers with access to private V79 conversations, private workspace
          content, or connected-provider credentials.
        </p>
      </Section>

      <Section title="9. Data security">
        <p>
          We use administrative, technical, and organisational safeguards appropriate to the nature of
          the information we process. Measures may include encryption of sensitive credentials,
          restricted access, role-based permissions, HTTPS, security headers, rate limiting,
          separation of application environments, logging, backups, and periodic security review.
        </p>
        <p>
          No Internet service can guarantee absolute security. Users are responsible for protecting
          their own credentials, devices, and authorised third-party accounts and for promptly
          reporting suspected unauthorised access.
        </p>
      </Section>

      <Section title="10. Data retention and deletion">
        <p>
          We retain information only for as long as reasonably required to provide the service,
          maintain legitimate business and security records, comply with legal or contractual
          obligations, resolve disputes, and enforce agreements. Retention varies by product and data
          type.
        </p>
        <p>
          OAuth access and refresh tokens are retained only while needed for an active authorised
          connection. Provider-specific API data is refreshed, removed, or deleted according to the
          applicable provider rules. You may request deletion of personal information we control by
          contacting us. We may retain information that law requires us to keep or limited records
          needed to document a deletion, security event, transaction, or legal obligation.
        </p>
      </Section>

      <Section title="11. Your choices and rights">
        <p>
          Subject to applicable law and appropriate identity verification, you may ask us to access,
          correct, update, or delete personal information we control, withdraw consent where
          processing relies on consent, or raise a concern about how your information is handled.
        </p>
        <p>
          Disconnecting a third-party account stops future provider access through that connection.
          Deleting information held by V79 does not automatically delete information held by Google,
          YouTube, LinkedIn, TikTok, Meta, or another provider; you must use the relevant provider's
          controls to manage data held by that provider.
        </p>
      </Section>

      <Section title="12. International processing">
        <p>
          Some technology providers used by V79 may process information outside Saint Lucia. Where
          this occurs, we use the service only for the purpose for which it was configured and apply
          reasonable contractual, technical, and access safeguards appropriate to the information and
          the service.
        </p>
      </Section>

      <Section title="13. Children and education services">
        <p>
          V79 business, finance, administration, and social-publishing services are intended for
          authorised adults and business users. Some V79 education products may be used by children or
          students. Where a service is intended for minors, it should be used with the authorisation
          and supervision required by applicable law, a parent or guardian, school, or responsible
          organisation. Minors must not connect social-media publishing accounts or administer
          business/financial workspaces unless legally authorised to do so.
        </p>
      </Section>

      <Section title="14. Changes to this policy">
        <p>
          We may update this Privacy Policy when our services, integrations, provider requirements, or
          applicable laws change. The current version and effective date will always be published at
          <strong> https://v79sl.com/privacy</strong>. Material changes affecting how already-collected
          data is used may require additional notice or consent.
        </p>
      </Section>

      <Section title="15. Contact and privacy requests">
        <p>
          For privacy questions, access/correction requests, provider-data deletion requests, or
          complaints, contact V79 Digital:
        </p>
        <BulletList>
          <li>Email: <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="mailto:vision79slu@gmail.com">vision79slu@gmail.com</a></li>
          <li>Phone: <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="tel:+17587260035">+1 758 726 0035</a></li>
          <li>Location: Saint Lucia</li>
        </BulletList>
      </Section>
    </>
  );
}

function DataDeletionInstructions() {
  return (
    <>
      <Section title="Request deletion of V79-held data">
        <p>
          You can ask V79 Digital to delete personal information or connected-provider data that V79
          controls by emailing <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="mailto:vision79slu@gmail.com">vision79slu@gmail.com</a>.
          Use the subject <strong>Data Deletion Request</strong> and identify the V79 product or
          workspace involved. Do not send passwords, OAuth tokens, recovery codes, or other secrets.
        </p>
        <p>
          We may need to verify your identity or your authority over the relevant business workspace
          before deleting information. We will delete or de-identify eligible V79-held information
          within the period required by applicable law and provider rules, subject to limited records
          we must retain for legal, security, fraud-prevention, accounting, or dispute purposes.
        </p>
      </Section>

      <Section title="Disconnect Google, YouTube and other providers">
        <p>
          For supported provider connections, use <strong>V79 Marketing → Social → Disconnect</strong>.
          For Google Business Profile and YouTube connections, V79 attempts to revoke the Google OAuth
          authorisation before deleting the local provider connection record.
        </p>
        <p>
          You can also revoke Google or YouTube access directly from your{" "}
          <External href="https://security.google.com/settings/security/permissions">
            Google security permissions
          </External>. Other providers such as LinkedIn, TikTok, Facebook, and Instagram also provide
          account settings where you can revoke third-party app access.
        </p>
      </Section>

      <Section title="What deletion from V79 does not delete">
        <p>
          Deleting data held by V79 does not automatically delete posts, videos, messages, account
          records, or other information held independently by Google, YouTube, LinkedIn, TikTok, Meta,
          or another provider. Use the relevant provider's own controls to delete information from that
          provider.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          For assistance with deletion or revocation, contact V79 Digital at{" "}
          <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="mailto:vision79slu@gmail.com">vision79slu@gmail.com</a>
          {" "}or <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="tel:+17587260035">+1 758 726 0035</a>.
        </p>
      </Section>
    </>
  );
}

function TermsOfService() {
  return (
    <>
      <Section title="1. Agreement to these Terms">
        <p>
          These Terms of Service ("Terms") govern your use of v79sl.com and V79-branded products and
          services that link to these Terms. By accessing or using a V79 service, creating an account,
          accepting an order or subscription, or authorising a connected provider, you agree to these
          Terms and to the applicable Privacy Policy.
        </p>
        <p>
          A signed proposal, statement of work, managed-services agreement, order form, subscription
          plan, or product-specific agreement may contain additional terms. If there is a conflict,
          the signed or product-specific agreement controls for that service to the extent of the
          conflict.
        </p>
      </Section>

      <Section title="2. Who may use the Services">
        <p>
          You must have legal capacity to enter into these Terms. If you use V79 on behalf of a
          company, school, organisation, or other entity, you represent that you have authority to bind
          that entity and to grant any permissions you configure.
        </p>
        <p>
          Business administration, finance, and social-publishing functions are intended for
          authorised adult users. Education products may have separate learner eligibility,
          supervision, or parental/guardian requirements.
        </p>
      </Section>

      <Section title="3. Accounts, workspaces and security">
        <p>
          You are responsible for information submitted under your account, maintaining the
          confidentiality of your credentials, restricting access to authorised personnel, and
          promptly reporting suspected compromise. You must not share credentials in a manner that
          defeats V79's access controls or attempt to access another customer's workspace.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>You must not use V79 services to:</p>
        <BulletList>
          <li>violate applicable law, regulation, court order, sanctions, or third-party rights;</li>
          <li>publish unlawful, fraudulent, deceptive, infringing, malicious, harassing, or abusive content;</li>
          <li>send spam, conduct unauthorised surveillance, harvest credentials, or impersonate another person or business;</li>
          <li>introduce malware, probe systems without authorisation, bypass security controls, or interfere with service availability;</li>
          <li>use provider APIs or connected accounts outside the permissions granted by the account owner or provider; or</li>
          <li>use AI functionality to create or automate conduct that would otherwise violate these Terms.</li>
        </BulletList>
      </Section>

      <Section title="5. Your content and publishing responsibility">
        <p>
          You retain ownership of content you submit to V79. You grant V79 a limited licence to host,
          process, transform, transmit, and publish that content only as necessary to provide the
          services and actions you request.
        </p>
        <p>
          You are responsible for verifying that you have the rights, licences, permissions, releases,
          and factual basis needed for content you upload or publish. You are also responsible for
          reviewing scheduled and AI-assisted content before publication, including prices, claims,
          promotions, images, music, trademarks, personal information, and regulated statements.
        </p>
      </Section>

      <Section title="6. Connected third-party services">
        <p>
          V79 may connect to third-party services including Google, YouTube, LinkedIn, TikTok, Meta,
          and other providers. Connecting an account authorises V79 to perform the specific actions
          covered by the permissions you approve. Provider services are governed by their own terms,
          policies, review requirements, quotas, and technical availability.
        </p>
        <p>
          If you use V79 features that access YouTube API Services, you also agree to be bound by the{" "}
          <External href="https://www.youtube.com/t/terms">YouTube Terms of Service</External>.
          Google's handling of information is described in the{" "}
          <External href="https://policies.google.com/privacy">Google Privacy Policy</External>.
        </p>
        <p>
          V79 is not responsible for a provider suspending an account, changing an API, rejecting an
          application, limiting quota, changing a permission, removing content, or otherwise changing
          or discontinuing a third-party service.
        </p>
      </Section>

      <Section title="7. AI-assisted features">
        <p>
          AI outputs can be incomplete, inaccurate, outdated, or unsuitable for a specific purpose.
          AI-generated text, analysis, images, recommendations, classifications, or calculations are
          tools to assist human work and are not guaranteed to be correct. You are responsible for
          reviewing outputs before relying on them, publishing them, making business decisions, or
          providing them to others.
        </p>
      </Section>

      <Section title="8. Finance, business and professional information">
        <p>
          Unless a signed engagement expressly states otherwise, V79 software and AI features provide
          organisational and informational tools and do not constitute legal, tax, accounting,
          investment, medical, or other regulated professional advice. Financial or forecasting
          outputs should be independently reviewed before material decisions are made.
        </p>
      </Section>

      <Section title="9. Subscriptions, fees and taxes">
        <p>
          Paid products, subscriptions, projects, managed services, training, and professional
          services are charged according to the applicable quotation, order, subscription plan, or
          agreement. Unless stated otherwise in that agreement, fees are exclusive of taxes or
          government charges that must legally be added.
        </p>
        <p>
          Renewal, cancellation, refund, credit, trial, and upgrade rules are those shown in the
          applicable order or product flow. Where mandatory consumer law gives you rights that cannot
          legally be waived, those rights remain unaffected.
        </p>
      </Section>

      <Section title="10. Service availability, support and changes">
        <p>
          We work to keep V79 services reliable and secure, but no online service is guaranteed to be
          uninterrupted or error-free. Maintenance, security events, Internet/provider failures,
          third-party outages, upgrades, or circumstances outside reasonable control may affect
          availability.
        </p>
        <p>
          Support response times and service levels apply only where they are stated in the relevant
          plan, managed-services agreement, or service contract. We may modify features to improve
          security, compliance, reliability, or product quality.
        </p>
      </Section>

      <Section title="11. Intellectual property">
        <p>
          V79 and its licensors retain all rights in V79 software, branding, designs, documentation,
          workflows, and other materials not supplied by you. These Terms grant you a limited,
          non-exclusive, non-transferable right to use the services for their intended purpose during
          your authorised access period. You may not copy, resell, reverse engineer, or create
          derivative works from protected V79 materials except where applicable law expressly permits
          it.
        </p>
      </Section>

      <Section title="12. Privacy and data protection">
        <p>
          Our handling of personal information is described in the{" "}
          <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="/privacy">
            V79 Digital Privacy Policy
          </a>. You are responsible for ensuring that information you upload about employees,
          customers, students, or other people was collected and provided lawfully and that you have
          any required notices, permissions, or consents.
        </p>
      </Section>

      <Section title="13. Suspension and termination">
        <p>
          We may restrict or suspend access when reasonably necessary to address security risk,
          non-payment, unlawful use, material breach of these Terms, provider-policy violations, or a
          threat to other customers or the service. Where practical and appropriate, we will provide
          notice and an opportunity to resolve the issue.
        </p>
        <p>
          You may stop using a service or request closure according to the applicable product or
          subscription process. Termination does not remove obligations that accrued before
          termination, including payment obligations or provisions that by their nature should
          survive.
        </p>
      </Section>

      <Section title="14. Disclaimers">
        <p>
          To the maximum extent permitted by applicable law, services are provided on an "as
          available" basis except for express warranties contained in a signed agreement. We do not
          warrant that every third-party integration, AI output, Internet connection, provider API, or
          customer-supplied configuration will be continuously available or error-free.
        </p>
      </Section>

      <Section title="15. Limitation of liability">
        <p>
          To the maximum extent permitted by applicable law, V79 will not be liable for indirect,
          incidental, special, exemplary, punitive, or consequential loss arising from use of the
          services, including lost profits, lost opportunity, or loss caused by a third-party provider,
          except where liability cannot legally be excluded.
        </p>
        <p>
          Any contractual liability cap stated in a signed order, proposal, or managed-services
          agreement will apply to that engagement. Nothing in these Terms excludes liability that
          applicable law does not permit us to exclude or limit.
        </p>
      </Section>

      <Section title="16. Responsibility for third-party claims">
        <p>
          If your unlawful use of the services, your content, or your violation of another person's
          rights causes a third-party claim against V79, you are responsible for losses and reasonable
          costs arising from that claim to the extent permitted by law and to the extent the claim was
          caused by your conduct.
        </p>
      </Section>

      <Section title="17. Governing law and disputes">
        <p>
          These Terms are governed by the laws of Saint Lucia, without prejudice to mandatory rights
          that may apply to a consumer in another jurisdiction. The parties should first attempt in
          good faith to resolve a dispute directly. Unless a binding customer agreement provides
          another lawful forum, disputes that cannot be resolved informally may be brought before the
          courts of competent jurisdiction in Saint Lucia.
        </p>
      </Section>

      <Section title="18. Changes to these Terms">
        <p>
          We may update these Terms to reflect product, security, legal, or provider changes. The
          current version and effective date will be published at <strong>https://v79sl.com/terms</strong>.
          If a material change requires additional consent, we will request it before the affected
          feature is used where required.
        </p>
      </Section>

      <Section title="19. Contact">
        <p>Questions about these Terms may be sent to:</p>
        <BulletList>
          <li>Email: <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="mailto:vision79slu@gmail.com">vision79slu@gmail.com</a></li>
          <li>Phone: <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="tel:+17587260035">+1 758 726 0035</a></li>
          <li>V79 Digital, Saint Lucia</li>
        </BulletList>
      </Section>
    </>
  );
}

export default function LegalPage({ type }: LegalPageProps) {
  const privacy = type === "privacy";
  const deletion = type === "data-deletion";
  const title = privacy ? "Privacy Policy" : deletion ? "Data Deletion Instructions" : "Terms of Service";
  const Icon = privacy ? ShieldCheck : FileText;

  useEffect(() => {
    document.title = `${title} | V79 Digital`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <header className="sticky top-0 z-40 border-b border-app-border bg-app-header-bg/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/" aria-label="V79 Digital home" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-v79-teal/50">
            <V79OfficialLogo size="md" />
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-btn-sec px-4 py-2 text-sm font-semibold text-app-text no-underline transition hover:border-v79-teal/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to V79 Digital
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-10 rounded-3xl border border-app-border bg-app-aside-bg/50 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-v79-teal dark:text-v79-teal-light">
            <Icon className="h-4 w-4" />
            V79 Digital Legal
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-app-text-sec">
            Effective {EFFECTIVE_DATE}. This document applies to V79 Digital services that link to it.
          </p>
        </div>

        <div className="space-y-8">
          {privacy ? <PrivacyPolicy /> : deletion ? <DataDeletionInstructions /> : <TermsOfService />}
        </div>

        <div className="mt-12 rounded-2xl border border-app-border bg-app-aside-bg/40 p-5 text-sm leading-6 text-app-text-sec">
          <strong className="text-app-text">Related:</strong>{" "}
          <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="/privacy">Privacy Policy</a>
          {" · "}
          <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="/terms">Terms of Service</a>
          {" · "}
          <a className="font-semibold text-v79-teal dark:text-v79-teal-light underline" href="/data-deletion">Data Deletion</a>
        </div>
      </main>

      <footer className="border-t border-app-border bg-app-header-bg px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-app-text-sec sm:flex-row">
          <span>© 2026 V79 Digital. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-v79-teal dark:hover:text-v79-teal-light" href="/privacy">Privacy Policy</a>
            <a className="hover:text-v79-teal dark:hover:text-v79-teal-light" href="/terms">Terms of Service</a>
            <a className="hover:text-v79-teal dark:hover:text-v79-teal-light" href="/data-deletion">Data Deletion</a>
            <a className="hover:text-v79-teal dark:hover:text-v79-teal-light" href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
