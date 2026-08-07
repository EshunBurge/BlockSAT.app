export const metadata = { title: "Terms of Service — BlockSAT" };

export default function TermsPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or otherwise using BlockSAT (&quot;the Service&quot;), you agree to be bound by these
        Terms of Service. If you do not agree to these terms, please do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        BlockSAT is an educational puzzle game that combines original block-stacking gameplay with SAT-style
        practice questions. The Service is intended to help students practice for standardized tests in an engaging
        format. BlockSAT is not affiliated with, endorsed by, or sponsored by the College Board or any official
        SAT test administrator.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You must provide accurate information when creating an account and are responsible for maintaining the
        confidentiality of your login credentials. You are responsible for all activity that occurs under your
        account.
      </p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use automated means to access the Service in a way that sends more requests than a human could reasonably produce</li>
        <li>Attempt to reverse-engineer, decompile, or extract the question bank for commercial redistribution</li>
        <li>Harass other users or post abusive content in any leaderboard or profile field</li>
        <li>Attempt to gain unauthorized access to other accounts or to the admin dashboard</li>
      </ul>

      <h2>5. Content Ownership</h2>
      <p>
        All game assets, artwork, and original question content are owned by BlockSAT or its licensors. You retain
        ownership of any content you submit (such as a username or avatar selection), but grant BlockSAT a license
        to display it within the Service, including on leaderboards.
      </p>

      <h2>6. Educational Disclaimer</h2>
      <p>
        BlockSAT practice questions are original, SAT-style questions created for practice purposes. They are not
        official College Board test questions, and correct performance on BlockSAT does not guarantee any
        particular score on an official SAT exam.
      </p>

      <h2>7. Termination</h2>
      <p>
        We may suspend or terminate your account if you violate these terms. You may stop using the Service and
        request account deletion at any time from your Account Settings.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        The Service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not
        guarantee that the Service will be uninterrupted, error-free, or completely secure.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, BlockSAT shall not be liable for any indirect, incidental, or
        consequential damages arising from your use of the Service.
      </p>

      <h2>10. Changes to These Terms</h2>
      <p>
        We may update these Terms of Service from time to time. Continued use of the Service after changes take
        effect constitutes acceptance of the revised terms.
      </p>

      <h2>11. Contact</h2>
      <p>Questions about these Terms can be sent to <a href="mailto:support@blocksat.app">support@blocksat.app</a>.</p>
    </article>
  );
}
