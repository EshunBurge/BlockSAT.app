export const metadata = { title: "Privacy Policy — BlockSAT" };

export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral max-w-none dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

      <h2>1. Information We Collect</h2>
      <p>When you use BlockSAT, we collect:</p>
      <ul>
        <li><strong>Account information:</strong> email address, username, and a hashed password (we never store your password in plain text).</li>
        <li><strong>Gameplay and study data:</strong> scores, XP, level, questions answered, accuracy by subject, streaks, and achievements, used to power your profile, dashboard, and leaderboards.</li>
        <li><strong>Preferences:</strong> your chosen practice focus, difficulty, sound settings, and unlocked themes/skins.</li>
      </ul>

      <h2>2. How We Use Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service</li>
        <li>Track your progress and display accurate statistics on your dashboard and profile</li>
        <li>Power leaderboards, daily challenges, and achievements</li>
        <li>Communicate with you about your account (e.g., email verification, password resets)</li>
      </ul>

      <h2>3. Data Storage</h2>
      <p>
        Account and gameplay data is stored in a PostgreSQL database. Authentication is handled by Supabase Auth in
        production deployments. We apply reasonable technical and organizational measures to protect your data.
      </p>

      <h2>4. Data Sharing</h2>
      <p>
        We do not sell your personal information. Your username, level, and public statistics may be visible to
        other users on leaderboards. We do not share your email address or password with any third party except as
        required by law.
      </p>

      <h2>5. Your Choices</h2>
      <ul>
        <li>You can update your username, preferences, and settings at any time from Account Settings.</li>
        <li>You can request deletion of your account and associated data from Account Settings.</li>
        <li>You can opt out of appearing on public leaderboards from your privacy settings.</li>
      </ul>

      <h2>6. Children&apos;s Privacy</h2>
      <p>
        BlockSAT is designed for students preparing for standardized tests, including users under 18. We do not
        knowingly collect more information than necessary to provide the Service, and we encourage parents/guardians
        to review their child&apos;s account settings.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and remember your preferences. We do not use third-party
        advertising cookies.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. We will note the &quot;Last updated&quot; date above when we do.</p>

      <h2>9. Contact</h2>
      <p>Questions about this Privacy Policy can be sent to <a href="mailto:privacy@blocksat.app">privacy@blocksat.app</a>.</p>
    </article>
  );
}
