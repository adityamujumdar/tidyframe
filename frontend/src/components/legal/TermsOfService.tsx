import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-4">
            TERMS OF SERVICE AGREEMENT
          </CardTitle>
          <div className="text-lg text-muted-foreground">
            <p className="font-semibold">TidyFrame AI Data Processing Platform</p>
            <p>Last Updated: August 23, 2025</p>
            <p>Effective Date: August 2, 2025</p>
          </div>
        </CardHeader>
        
        <CardContent className="prose max-w-none">
          <p className="text-sm text-muted-foreground mb-8">
            This Terms of Service Agreement ("Agreement") is a legally binding contract between you ("Customer," 
            "you," or "your") and TidyFrame AI, LLC ("Company," "we," "us," or "our"). Please read it carefully.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 1: DEFINITIONS AND INTERPRETATION</h2>
            
            <h3 className="text-lg font-semibold mb-3">1.1 Definitions</h3>
            <p className="mb-4">For purposes of this Agreement, the following terms shall have the meanings set forth below:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>"Agreement" or "Terms"</strong> means this Terms of Service Agreement, as it may be amended from time to time.</li>
              <li><strong>"Company," "we," "us," or "our"</strong> means TidyFrame AI, LLC, a Delaware limited liability company, with its principal place of business at 8 The Green STE B, Dover, DE 19901.</li>
              <li><strong>"Customer," "you," or "your"</strong> means the individual or entity accessing or using the Services.</li>
              <li><strong>"Platform"</strong> means the TidyFrame AI data processing platform accessible at tidyframe.com and any related applications, software, or services.</li>
              <li><strong>"Services"</strong> means the data processing, analysis, and related services provided through the Platform.</li>
              <li><strong>"User Content"</strong> means any data, files, information, or other content uploaded, submitted, or transmitted by you through the Platform.</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3">1.2 Interpretation</h3>
            <p className="mb-4">This Agreement shall be interpreted in accordance with the laws of the State of Delaware. Headings are for convenience only and do not affect interpretation.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 2: ACCEPTANCE AND SCOPE</h2>
            
            <h3 className="text-lg font-semibold mb-3">2.1 Binding Agreement</h3>
            <p className="mb-4">By accessing, browsing, or using the Platform, you acknowledge that you have read, understood, and agree to be bound by this Agreement and our Privacy Policy, which is incorporated herein by reference.</p>
            
            <h3 className="text-lg font-semibold mb-3">2.2 Capacity</h3>
            <p className="mb-4">You represent and warrant that: (a) you are at least 18 years of age; (b) you have the legal capacity to enter into this Agreement; and (c) if you are acting on behalf of an entity, you have the full authority to bind such entity to this Agreement.</p>
            
            <h3 className="text-lg font-semibold mb-3">2.3 Modifications</h3>
            <p className="mb-4">We reserve the right to modify this Agreement at any time by posting the revised terms on the Platform. We will notify you of material changes, which will become effective thirty (30) days after posting. Your continued use of the Services after the effective date constitutes your acceptance of the modifications.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 3: SERVICE DESCRIPTION AND AVAILABILITY</h2>
            
            <h3 className="text-lg font-semibold mb-3">3.1 Services Overview</h3>
            <p className="mb-4">The Platform provides automated data processing, cleaning, analysis, and transformation services for structured and unstructured datasets uploaded by customers.</p>
            
            <h3 className="text-lg font-semibold mb-3">3.2 Service Limitations</h3>
            <p className="mb-2">Our Services are subject to limitations, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>(a) Processing capacity and file size limits as specified in your service plan;</li>
              <li>(b) Supported file formats and data types as documented on the Platform;</li>
              <li>(c) Geographic restrictions and compliance requirements;</li>
              <li>(d) Technical limitations inherent in automated processing systems.</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3">3.3 Service Availability</h3>
            <p className="mb-4">We will use commercially reasonable efforts to maintain high availability but do not guarantee uninterrupted service. We may suspend Services for maintenance, updates, or security measures. We will provide advance notice where practicable.</p>
            
            <h3 className="text-lg font-semibold mb-3">3.4 No Professional Advice</h3>
            <p className="mb-4">The Services provide data processing tools and outputs. They are not intended to be a substitute for professional, legal, financial, or medical advice. You are solely responsible for validating all outputs and seeking appropriate professional consultation.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 4: USER ACCOUNTS AND REGISTRATION</h2>
            
            <h3 className="text-lg font-semibold mb-3">4.1 Account Creation</h3>
            <p className="mb-4">To access the Services, you must create an account by providing accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials.</p>
            
            <h3 className="text-lg font-semibold mb-3">4.2 Account Security</h3>
            <p className="mb-2">You agree to: </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>(a) use a strong, unique password;</li>
              <li>(b) notify us immediately of any unauthorized access to your account;</li>
              <li>(c) not share your account credentials; and</li>
              <li>(d) accept full responsibility for all activities that occur under your account.</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3">4.3 Account Suspension</h3>
            <p className="mb-4">We reserve the right to suspend or terminate your account if you violate this Agreement, engage in fraudulent activity, or pose a security risk to the Platform or other users, with or without prior notice.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 5: ACCEPTABLE USE POLICY</h2>
            
            <h3 className="text-lg font-semibold mb-3">5.1 Permitted Use</h3>
            <p className="mb-4">You may use the Services solely for lawful business and personal purposes in accordance with this Agreement and all applicable laws.</p>
            
            <h3 className="text-lg font-semibold mb-3">5.2 Prohibited Activities</h3>
            <p className="mb-2">You shall not:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>(a) Upload, process, or transmit any unlawful, harmful, defamatory, obscene, or otherwise objectionable content;</li>
              <li>(b) Violate any applicable laws, regulations, or third-party rights, including privacy and intellectual property rights;</li>
              <li>(c) Upload malware, viruses, or any other malicious code;</li>
              <li>(d) Attempt to gain unauthorized access to our systems, networks, or other users' accounts;</li>
              <li>(e) Reverse engineer, decompile, or attempt to derive the source code of the Platform;</li>
              <li>(f) Use automated tools to scrape, harvest, or collect data from the Platform without our express written permission;</li>
              <li>(g) Interfere with or disrupt the Platform's functionality, security, or integrity;</li>
              <li>(h) Impersonate any person or entity or misrepresent your affiliation with any person or entity;</li>
              <li>(i) Use the Services for competitive analysis or to develop a competing product;</li>
              <li>(j) Process the personal data of others without a proper legal basis and authorization.</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3">5.3 Content Monitoring</h3>
            <p className="mb-4">We reserve the right, but have no obligation, to monitor, review, or remove any User Content that, in our sole discretion, violates this Agreement.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 6: PAYMENT TERMS AND BILLING</h2>
            
            <h3 className="text-lg font-semibold mb-3">6.1 Service Plans</h3>
            <p className="mb-4">Services are provided on a subscription or pay-per-use basis according to the pricing plans displayed on the Platform at the time of purchase.</p>
            
            <h3 className="text-lg font-semibold mb-3">6.2 Payment Processing</h3>
            <p className="mb-4">Payments are processed through third-party payment processors, such as Stripe, Inc. By providing your payment information, you authorize us and our payment processor to charge all applicable fees to your selected payment method.</p>
            
            <h3 className="text-lg font-semibold mb-3">6.3 Billing and Invoicing</h3>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>(a) Subscription fees are billed in advance on a recurring basis (e.g., monthly or annually).</li>
              <li>(b) Usage-based fees are billed monthly in arrears.</li>
              <li>(c) All fees are non-refundable except as expressly provided in this Agreement.</li>
              <li>(d) Prices are subject to change with thirty (30) days' notice.</li>
            </ul>
            
            <h3 className="text-lg font-semibold mb-3">6.4 Late Payment</h3>
            <p className="mb-4">Overdue accounts may be suspended without notice. We may charge late fees of 1.5% per month on the outstanding balance or the maximum rate permitted by law, whichever is less.</p>
            
            <h3 className="text-lg font-semibold mb-3">6.5 Taxes</h3>
            <p className="mb-4">You are responsible for all applicable taxes, duties, and governmental assessments (excluding taxes based on our net income) related to your use of the Services.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 10: GEOGRAPHIC RESTRICTIONS</h2>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-red-800">10.1 U.S. Services Only</h3>
              <p className="mb-2 text-red-700">The Services are intended solely for users located in the United States and are provided in compliance with U.S. laws and regulations.</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">10.2 VPN and Proxy Restrictions</h3>
              <p className="mb-2 text-yellow-700">Use of VPNs, proxy servers, or other methods to conceal your location or circumvent geographic restrictions is strictly prohibited and will result in immediate account termination.</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-3">10.3 Export Controls</h3>
            <p className="mb-4">You are responsible for complying with all applicable U.S. export control and economic sanctions laws.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 15: DISPUTE RESOLUTION</h2>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">15.3 Mandatory Arbitration</h3>
              <p className="mb-2 text-blue-700">Except for claims seeking injunctive relief, all disputes arising out of this Agreement shall be resolved through binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules. The arbitration shall take place in New Castle County, Delaware.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-800">15.4 Class Action Waiver</h3>
              <p className="mb-2 text-blue-700 font-semibold">YOU AND THE COMPANY AGREE THAT ANY PROCEEDING, WHETHER IN ARBITRATION OR IN COURT, WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">ARTICLE 18: CONTACT INFORMATION AND LEGAL NOTICES</h2>
            
            <h3 className="text-lg font-semibold mb-3">18.1 Company Contact Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p><strong>TidyFrame AI, LLC</strong></p>
              <p>8 The Green STE B, Dover, DE 19901</p>
              <p>United States</p>
              <p>Email: tidyframeai@gmail.com</p>
            </div>
            
            <h3 className="text-lg font-semibold mb-3">18.2 Legal Notices</h3>
            <p className="mb-4">All legal notices must be delivered in writing to the address specified above and will be deemed effective upon receipt.</p>
            
            <h3 className="text-lg font-semibold mb-3">18.3 Customer Support</h3>
            <p className="mb-4">For technical support and general inquiries, please contact us at tidyframeai@gmail.com. Our support hours are 9:00 AM to 5:00 PM Pacific Time, Monday through Friday. We aim to provide an initial response to support inquiries within one (1) business day.</p>
          </section>

          <div className="mt-12 pt-8 border-t">
            <p className="text-center font-semibold text-lg">
              BY USING THE SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}