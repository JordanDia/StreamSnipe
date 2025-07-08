import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface PricingTier {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  popular?: boolean
  buttonText: string
  buttonVariant: 'primary' | 'secondary'
}

const Pricing = () => {
  const { user } = useAuth()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const pricingTiers: PricingTier[] = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with basic clipping',
      features: [
        '5 clips per month',
        '720p quality',
        'Basic time range selection',
        'Standard processing',
        'Community support'
      ],
      buttonText: 'Get Started Free',
      buttonVariant: 'secondary'
    },
    {
      name: 'Pro',
      price: billingPeriod === 'monthly' ? 9.99 : 99.99,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      description: 'For content creators who want more control',
      features: [
        '50 clips per month',
        '1080p quality',
        'Advanced time range selection',
        'Priority processing',
        'Email support',
        'Custom clip titles',
        'Bulk processing'
      ],
      popular: true,
      buttonText: 'Start Pro Trial',
      buttonVariant: 'primary'
    },
    {
      name: 'Creator',
      price: billingPeriod === 'monthly' ? 24.99 : 249.99,
      period: billingPeriod === 'monthly' ? 'month' : 'year',
      description: 'For professional streamers and agencies',
      features: [
        'Unlimited clips',
        '4K quality',
        'Advanced analytics',
        'Priority processing',
        'Priority support',
        'API access',
        'White-label options',
        'Team collaboration'
      ],
      buttonText: 'Start Creator Trial',
      buttonVariant: 'secondary'
    }
  ]

  const handleSubscribe = (tier: PricingTier) => {
    if (!user) {
      // Redirect to sign up
      return
    }
    
    // TODO: Implement subscription logic
    console.log(`Subscribing to ${tier.name} plan`)
  }

  const getSavings = () => {
    const monthlyTotal = pricingTiers[1].price * 12
    const yearlyTotal = pricingTiers[1].price
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100)
  }

  return (
    <div className="pt-4 px-4 text-white min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start clipping your favorite Twitch moments with our powerful tools. 
            Choose the plan that fits your needs and scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700 transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                Save {getSavings()}%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                tier.popular 
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-6">{tier.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-gray-400">/{tier.period}</span>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(tier)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    tier.buttonVariant === 'primary'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                  }`}
                >
                  {user ? tier.buttonText : 'Sign Up to Start'}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg mb-4">What's included:</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Can I change my plan anytime?</h3>
              <p className="text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">What happens to my clips if I cancel?</h3>
              <p className="text-gray-400">
                Your existing clips remain accessible. You just won't be able to create new ones until you resubscribe.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Do you offer refunds?</h3>
              <p className="text-gray-400">
                We offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Is there a free trial?</h3>
              <p className="text-gray-400">
                Yes! All paid plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to start clipping?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who are already using our platform to create amazing clips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/signup"
                  className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/signin"
                  className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-lg font-medium transition-colors border border-gray-600"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing 