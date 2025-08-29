export const VISUAL_EXAMPLES_SECTION_PROMPT = `
You are a visionary UI/UX designer and brand experience architect. Create compelling visual examples that demonstrate how this brand comes to life across digital touchpoints and real-world applications.

CREATIVE MISSION:
Design visual examples that tell the story of the brand in action - showcase how the identity system creates meaningful, engaging experiences for users. Let the brand's personality, industry context, and target audience inspire innovative applications that go beyond standard templates.

TECHNICAL FOUNDATION:
- Raw HTML with Tailwind CSS utilities only
- Single minified line, A4 portrait optimized
- Use PrimeIcons for visual elements (pi pi-icon-name)
- Replace brand placeholders with actual project values
- Create detailed, realistic mockups that inspire
- Professional tone with creative flair

CREATIVE FREEDOM:
You have complete control over:
- Interface design approaches and user experience flows
- Brand application contexts and scenarios
- Visual storytelling through mockup presentations
- Innovation in demonstrating brand consistency
- Platform selection and user journey mapping
- Creative interpretation of brand personality in UI

BRAND EXPERIENCE STORIES:
Choose applications that best showcase this brand:
- Mobile applications and user interfaces
- Web platforms and digital experiences
- Marketing materials and campaigns
- Physical products and packaging
- Social media and content applications
- Enterprise software and dashboards
- E-commerce and retail experiences

CONTEXT-DRIVEN APPLICATIONS:
Adapt your examples to the brand context:
- Tech/SaaS: Dashboards, mobile apps, developer tools
- Creative: Portfolio sites, design tools, artistic platforms
- Healthcare: Patient apps, medical interfaces, wellness platforms
- Finance: Banking apps, trading platforms, financial dashboards
- Retail: E-commerce sites, mobile shopping, brand experiences
- Education: Learning platforms, student apps, educational tools

STORYTELLING THROUGH MOCKUPS:
Create examples that demonstrate:
- Brand personality expression through UI design
- Consistent visual language across touchpoints  
- User experience that aligns with brand values
- Innovative applications that inspire teams
- Real-world usage scenarios and contexts
- Emotional connection between brand and user

PROJECT CONTEXT:
              </div>
              <div class="w-16"></div>
            </div>
          </div>
          
          <!-- Web Content -->
          <div class="bg-white rounded-b-xl overflow-hidden">
            <!-- Header Navigation -->
            <div class="bg-white border-b border-gray-100 px-8 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-8">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
                    <span class="text-xl font-bold text-gray-900">{{Brand}}</span>
                  </div>
                  <nav class="hidden md:flex gap-6">
                    <a class="text-sm font-medium text-blue-600">Dashboard</a>
                    <a class="text-sm font-medium text-gray-600 hover:text-gray-900">Projects</a>
                    <a class="text-sm font-medium text-gray-600 hover:text-gray-900">Analytics</a>
                    <a class="text-sm font-medium text-gray-600 hover:text-gray-900">Settings</a>
                  </nav>
                </div>
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div class="w-8 h-8 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <!-- Main Content -->
            <div class="p-8">
              <!-- Hero Section -->
              <div class="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white mb-8">
                <h1 class="text-3xl font-bold mb-2">Welcome to {{Brand Name}}</h1>
                <p class="text-blue-100 mb-6">Streamline your workflow with our powerful platform</p>
                <button class="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">Get Started</button>
              </div>
              
              <!-- Dashboard Cards -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Analytics</h3>
                    <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div class="w-4 h-4 bg-blue-600 rounded"></div>
                    </div>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 mb-2">2,847</p>
                  <p class="text-sm text-green-600">+12% from last month</p>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Projects</h3>
                    <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <div class="w-4 h-4 bg-purple-600 rounded"></div>
                    </div>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 mb-2">24</p>
                  <p class="text-sm text-blue-600">3 active this week</p>
                </div>
                
                <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Performance</h3>
                    <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <div class="w-4 h-4 bg-green-600 rounded"></div>
                    </div>
                  </div>
                  <p class="text-2xl font-bold text-gray-900 mb-2">98.5%</p>
                  <p class="text-sm text-green-600">Excellent uptime</p>
                </div>
              </div>
              
              <!-- Recent Activity Table -->
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div class="divide-y divide-gray-100">
                  <div class="px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <div class="w-5 h-5 bg-blue-600 rounded"></div>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Project Updated</p>
                        <p class="text-sm text-gray-600">Design System v2.0</p>
                      </div>
                    </div>
                    <span class="text-sm text-gray-500">2 hours ago</span>
                  </div>
                  <div class="px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <div class="w-5 h-5 bg-green-600 rounded"></div>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">Deployment Successful</p>
                        <p class="text-sm text-gray-600">Production environment</p>
                      </div>
                    </div>
                    <span class="text-sm text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-8 space-y-4">
          <h4 class="text-lg font-bold text-gray-800">Design Principles</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">•</span>Responsive grid system with consistent spacing and alignment</li>
            <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">•</span>Brand-consistent color palette across all interface elements</li>
            <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">•</span>Clear information hierarchy with appropriate typography scales</li>
            <li class="flex items-start gap-2"><span class="text-purple-500 mt-1">•</span>Intuitive navigation and user-friendly interaction patterns</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Implementation Guidelines -->
    <div class="mt-16 bg-gradient-to-r from-gray-800 to-slate-900 rounded-3xl p-10 text-white">
      <h3 class="text-2xl font-bold mb-8 text-center">Implementation Guidelines</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h4 class="font-bold mb-2">Consistency</h4>
          <p class="text-sm text-gray-300">Maintain visual consistency across all platforms</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h4 class="font-bold mb-2">Accessibility</h4>
          <p class="text-sm text-gray-300">Ensure WCAG compliance in all implementations</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 2h2v4h4V6h2v8h-2v-4H9v4H7V4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h4 class="font-bold mb-2">Responsive</h4>
          <p class="text-sm text-gray-300">Optimize for all screen sizes and devices</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <h4 class="font-bold mb-2">Quality</h4>
          <p class="text-sm text-gray-300">Maintain high standards in all brand applications</p>
        </div>
      </div>
    </div>
  </div>
</section>

STYLE & CONTENT RULES:
- Create realistic, detailed UI mockups using only Tailwind classes
- Demonstrate proper brand color usage and hierarchy
- Show responsive design principles and accessibility considerations
- Include specific measurements and technical specifications
- Provide actionable insights for implementation teams
- Ensure all examples reflect modern UI/UX best practices
- Replace {{Brand Name}}, {{Brand}}, {{brand-domain}} with actual project data

PROJECT INPUT:
`;
