import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Database,
  Zap,
  Shield,
  Users,
  Building,
  ArrowRight,
  Wheat,
  BarChart3,
  Scale,
  RefreshCw
} from 'lucide-react';
import UniversalFileUpload from '@/components/upload/UniversalFileUpload';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Parsing',
      description: 'Advanced AI-powered name parsing for accurate entity detection with enterprise-grade accuracy.'
    },
    {
      icon: Database,
      title: 'Smart Validation',
      description: 'Intelligent validation with pattern recognition and entity classification for maximum accuracy.'
    },
    {
      icon: Users,
      title: 'Entity Classification',
      description: 'Automatically identify persons, companies, trusts, and agricultural entities.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process thousands of names in minutes with our optimized processing pipeline.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption at rest and GDPR compliance.'
    },
    {
      icon: Building,
      title: 'Agricultural Specialization',
      description: 'Specialized patterns for farm, ranch, and agricultural business detection.'
    }
  ];

  const useCases = [
    {
      title: 'Agricultural Data Processing',
      description: 'Process farm ownership records, land trust documents, and agricultural business listings.',
      icon: Wheat,
      color: 'text-green-500'
    },
    {
      title: 'Business Intelligence',
      description: 'Clean and categorize customer databases, vendor lists, and partner directories.',
      icon: BarChart3,
      color: 'text-blue-500'
    },
    {
      title: 'Legal & Compliance',
      description: 'Process beneficiary lists, trust documents, and legal entity classifications.',
      icon: Scale,
      color: 'text-purple-500'
    },
    {
      title: 'Data Migration',
      description: 'Migrate legacy systems with inconsistent name formats to clean, structured data.',
      icon: RefreshCw,
      color: 'text-orange-500'
    }
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section with Prominent Upload */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6">
              🚀 Now Processing 1M+ Names Monthly
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              AI-Powered Name Parsing
              <span className="text-primary"> Made Simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform messy name data into clean, categorized records with high accuracy. 
              Try it free with up to 5 names or sign up for unlimited processing.
            </p>
          </div>

          {/* Prominent Upload Section */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="bg-gradient-to-br from-primary/5 via-blue-50 to-purple-50 dark:from-primary/5 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-8 border border-primary/10">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Try tidyframe.com Now
                </h2>
                <p className="text-muted-foreground text-lg">
                  Upload your CSV, Excel, or text file and see our AI-powered name parsing in action
                </p>
                <div className="mt-3 p-3 bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                  <p className="font-bold text-base text-black dark:text-white">
                    ⚠️ IMPORTANT: Files must have a column named:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded font-bold text-black dark:text-white">names</code>
                    <span className="font-bold text-black dark:text-white">OR</span>
                    <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded font-bold text-black dark:text-white">addressee</code>
                    <span className="font-bold text-black dark:text-white">OR</span>
                    <code className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded font-bold text-black dark:text-white">process addressee</code>
                  </div>
                </div>
              </div>
              
              <UniversalFileUpload 
                showTitle={false} 
                compact={true}
                onUploadSuccess={(jobId) => {
                  // Handle successful upload for landing page
                  console.log('Upload successful:', jobId);
                  // Could show inline results or navigate to a public status page
                }}
              />
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="text-center mb-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/auth/register">
                <Button size="lg" className="text-lg px-8">
                  Sign Up for More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Free Anonymous Parsing • No credit card required • Instant results
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">95%+</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">Names Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">&lt;1min</div>
              <div className="text-sm text-muted-foreground">Per 1000 Names</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our multi-stage processing pipeline combines cutting-edge machine learning 
              with comprehensive database validation for unmatched accuracy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:bg-white dark:hover:bg-gray-900 hover:border-primary/20 hover:scale-[1.02] cursor-pointer group">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perfect for Your Industry
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From agricultural records to business databases, TidyFrame adapts to your specific needs.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-800/10 dark:bg-gray-700/50 flex items-center justify-center mb-4">
                      <Icon className={`h-8 w-8 ${useCase.color}`} />
                    </div>
                    <CardTitle className="text-lg">{useCase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{useCase.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get from messy data to clean results in just three simple steps.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Data</h3>
              <p className="text-muted-foreground">
                Upload CSV, Excel, or text files with names to be processed. 
                Our system handles various formats and encodings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Processing</h3>
              <p className="text-muted-foreground">
                Our AI analyzes each name using advanced Gemini AI models, 
                and applies specialized agricultural patterns.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Download Results</h3>
              <p className="text-muted-foreground">
                Get your processed data with parsed names, entity types, 
                gender detection, and confidence scores.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses using tidyframe.com to process their name data 
            with unmatched accuracy and speed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </Link>
          </div>
          
          <p className="text-sm opacity-75 mt-6">
            Try 5 anonymous parses free • $80/month for 100,000 parses • Full support included
          </p>
        </div>
      </section>
    </div>
  );
}