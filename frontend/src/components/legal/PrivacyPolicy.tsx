import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-4">
            PRIVACY POLICY
          </CardTitle>
          <div className="text-lg text-muted-foreground">
            <p>Last updated August 23, 2025</p>
          </div>
        </CardHeader>
        
        <CardContent className="prose max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            This Privacy Notice for TidyFrame AI, LLC ("we," "us," or "our"), describes how and why we 
            might access, collect, store, use, and/or share ("process") your personal information when you 
            use our services ("Services"), including when you:
          </p>
          <ul className="list-disc pl-6 mb-6">
            <li>Visit our website at http://www.tidyframe.com or any website of ours that links to this Privacy Notice.</li>
            <li>Engage with us in other related ways, including any sales, marketing, or events.</li>
          </ul>

          <p className="mb-8">
            Reading this Privacy Notice will help you understand your privacy rights and choices. If you do 
            not agree with our policies and practices, please do not use our Services. If you still have any 
            questions or concerns, please contact us at <strong>tidyframeai@gmail.com</strong>.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">SUMMARY OF KEY POINTS</h2>
            <p className="mb-4 italic">This summary provides key points from our Privacy Notice. You can find more details by reviewing the full policy below.</p>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">What personal information do we process?</h4>
                <p className="text-sm">When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us. This includes identity and contact information, account credentials, financial information, service content you upload, and technical data like your IP address.</p>
              </div>

              <div>
                <h4 className="font-semibold">Do we process any sensitive personal information?</h4>
                <p className="text-sm">We do not process sensitive personal information. If our services ever require it, we will obtain your explicit consent and apply enhanced security protections.</p>
              </div>

              <div>
                <h4 className="font-semibold">Do we collect any information from third parties?</h4>
                <p className="text-sm">Yes, we may receive information from authentication providers like Google, payment processors, business partners who refer you to us, and public sources.</p>
              </div>

              <div>
                <h4 className="font-semibold">How do we process your information?</h4>
                <p className="text-sm">We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with the law.</p>
              </div>

              <div>
                <h4 className="font-semibold">In what situations and with which parties do we share personal information?</h4>
                <p className="text-sm">We may share information with vetted third-party service providers who assist our operations, such as payment processors and cloud infrastructure providers. We do not and will not sell your personal information.</p>
              </div>

              <div>
                <h4 className="font-semibold">How do we keep your information safe?</h4>
                <p className="text-sm">We have implemented a comprehensive security framework with organizational and technical procedures to protect your personal information, including encryption and strict access controls. However, no technology is 100% secure, and we cannot guarantee absolute security.</p>
              </div>

              <div>
                <h4 className="font-semibold">What are your rights?</h4>
                <p className="text-sm">Depending on your location, you may have the right to access, correct, or delete your personal information, among other rights.</p>
              </div>

              <div>
                <h4 className="font-semibold">How do you exercise your rights?</h4>
                <p className="text-sm">The easiest way to exercise your rights is by emailing us at <strong>tidyframeai@gmail.com</strong>.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
            
            <h3 className="text-lg font-semibold mb-3">Personal information you disclose to us</h3>
            <p className="mb-4 italic">In Short: We collect personal information that you provide to us.</p>
            
            <p className="mb-4">We collect personal information that you voluntarily provide when you register on the Services, express an interest in our products, or otherwise contact us. The information we collect includes:</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Identity and Contact Information:</strong> Full name, email address, phone number, and business name.</li>
              <li><strong>Account Credentials:</strong> Username, password, and other authentication information for account creation and management.</li>
              <li><strong>Financial Information:</strong> Billing address and payment method details, which are processed through our third-party payment processor, Stripe.</li>
              <li><strong>Service Content:</strong> Files, documents, data sets, and other content you upload for processing.</li>
              <li><strong>Communication Records:</strong> Messages, support requests, and other communications with our team.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">Information automatically collected</h3>
            <p className="mb-4 italic">In Short: Some information — such as your Internet Protocol (IP) address and browser and device characteristics — is collected automatically when you visit our Services.</p>
            
            <p className="mb-4">We automatically collect certain information when you visit or use the Services. This information does not reveal your specific identity but may include:</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Device and Browser Information:</strong> IP address, browser type and version, operating system, and device identifiers.</li>
              <li><strong>Usage Analytics:</strong> Pages visited, time spent on services, click patterns, and feature usage.</li>
              <li><strong>Location Data:</strong> General geographic location derived from your IP address (not precise geolocation).</li>
            </ul>

            <h3 className="text-lg font-semibold mb-3">Information collected from other sources</h3>
            <p className="mb-4 italic">In Short: We may collect limited data from public databases, marketing partners, social media platforms, and other outside sources.</p>
            
            <p className="mb-4">We may receive personal information about you from other sources, including:</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Authentication Providers:</strong> Profile information from Google OAuth and other single sign-on services.</li>
              <li><strong>Payment Processors:</strong> Transaction confirmations and payment status updates.</li>
              <li><strong>Business Partners:</strong> Contact information when you are referred by authorized partners.</li>
              <li><strong>Public Sources:</strong> Publicly available business contact information for B2B communications.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
            <p className="mb-4 italic">In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</p>
            
            <p className="mb-4">We process your information for a variety of reasons, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Service Delivery and Performance:</strong> To provide, maintain, and improve our data processing services, process your uploaded content, and provide customer support.</li>
              <li><strong>Business Operations and Security:</strong> To maintain website functionality, implement security measures, detect fraudulent activity, and conduct internal analytics.</li>
              <li><strong>Legal and Regulatory Compliance:</strong> To comply with applicable laws, respond to lawful requests from government authorities, and establish or defend legal claims.</li>
            </ul>
            
            <p className="mb-4">When acting as a Service Provider under the CCPA/CPRA, we only process personal information for the business purposes specified in our client agreements and do not sell, retain, or use it for any other purpose.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
            <p className="mb-4 italic">In Short: We may share information in specific situations and with specific third parties.</p>
            
            <p className="mb-4">We may share your personal information with carefully vetted third-party service providers who assist our operations, including:</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Payment Processing:</strong> Stripe, Inc. for transaction processing.</li>
              <li><strong>Cloud Infrastructure:</strong> Amazon Web Services (AWS) or Google Cloud Platform for secure data storage and processing.</li>
              <li><strong>Analytics and Performance:</strong> Google Analytics (with IP anonymization) for website optimization.</li>
            </ul>
            
            <p className="mb-4">We may also disclose information to comply with legal obligations or during a business transfer, like a merger. <strong>We do not and will not sell personal information to third parties or share it for cross-context behavioral advertising.</strong></p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
            <p className="mb-4 italic">In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</p>
            
            <p className="mb-4">We retain personal information only for as long as necessary. Our specific retention schedules are:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Content and Uploaded Files:</strong> Automatically deleted within 10 minutes after processing completion for security and privacy protection.</li>
                <li><strong>Account Information:</strong> Retained while your account is active; inactive accounts are deleted after 3 years.</li>
                <li><strong>Billing Records:</strong> Retained for 7 years for tax and audit purposes.</li>
                <li><strong>Security Logs:</strong> Retained for 1 year.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
            <p className="mb-4 italic">In Short: We aim to protect your personal information through a system of organizational and technical security measures.</p>
            
            <p className="mb-4">We implement a comprehensive, industry-standard security framework that includes:</p>
            
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Encryption Protocols:</strong> TLS 1.3 encryption for data in transit and AES-256 for data at rest.</li>
              <li><strong>Access Controls:</strong> Role-based access control with the principle of least privilege and regular access audits.</li>
              <li><strong>Infrastructure Security:</strong> Secure cloud hosting, network firewalls, and regular vulnerability assessments.</li>
              <li><strong>Data Breach Response:</strong> A procedure for immediate containment, investigation, and notification in the event of a security incident.</li>
            </ul>
            
            <p className="mb-4"><strong>Despite our safeguards, no electronic transmission is 100% secure.</strong></p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
            <p className="mb-4 italic">In Short: You may review, change, or terminate your account at any time.</p>
            
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li><strong>Request access</strong> to and a copy of your personal information.</li>
              <li><strong>Request correction</strong> of inaccurate information.</li>
              <li><strong>Request deletion</strong> of your personal information, subject to certain exceptions.</li>
              <li><strong>Opt-out of sale and sharing</strong> of your personal information (though we do not do this).</li>
              <li><strong>Not be discriminated against</strong> for exercising your rights.</li>
            </ul>
            
            <p className="mb-4">To exercise your rights, please submit a request to <strong>tidyframeai@gmail.com</strong>. We will respond within the timeframes required by law.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. GEOGRAPHIC RESTRICTIONS AND INTERNATIONAL DATA TRANSFERS</h2>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-red-800 mb-2">Service Availability</h4>
              <p className="text-red-700">Our Services are designed and intended only for users located within the United States.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">International Data Transfers</h4>
              <p className="text-blue-700">Personal information will not be transferred internationally. All our primary data processing occurs within the United States.</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">VPN Usage</h4>
              <p className="text-yellow-700">Users accessing our Services via VPNs or other location-masking technologies do so at their own risk and are responsible for complying with their local laws. We disclaim liability for any violations.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">16. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
            
            <p className="mb-4">If you have questions or comments about this notice, you may email us at <strong>tidyframeai@gmail.com</strong> or contact us by post at:</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p><strong>TidyFrame AI, LLC</strong></p>
              <p>8 The Green STE B, Dover, DE 19901</p>
              <p>United States</p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy is governed by the laws of Delaware, United States. Any disputes arising under this Policy shall be resolved through good faith negotiation, and if that fails, through binding arbitration in Delaware.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}