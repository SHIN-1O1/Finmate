'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Investment } from '@/lib/investment-types';
import { UserProfile } from '@/lib/types';
import { investmentAdvisor, InvestmentAdvisorOutput } from '@/ai/flows/investment-advisor';
import { Lightbulb, TrendingUp, AlertCircle, Loader } from 'lucide-react';

interface InvestmentRecommendationsProps {
  profile?: UserProfile;
  investments: Investment[];
}

export default function InvestmentRecommendations({ profile, investments }: InvestmentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<InvestmentAdvisorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [riskTolerance, setRiskTolerance] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const loadRecommendations = async () => {
    if (!profile || !profile.role) return;

    setLoading(true);
    try {
      const role = profile.role as 'Student' | 'Professional' | 'Housewife';
      const result = await investmentAdvisor({
        role,
        income: profile.income,
        savings: profile.monthlySavings || 0,
        currentInvestments: investments.map(inv => ({
          type: inv.type,
          amount: inv.purchaseAmount,
        })),
        riskTolerance,
        investmentTimeline: 5,
        taxSavingGoal: profile.income * 0.3,
      });

      setRecommendations(result);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [profile, riskTolerance]);

  if (!profile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Complete your profile first to get AI recommendations</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Tolerance Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Risk Tolerance</CardTitle>
          <CardDescription>This helps us recommend suitable investments for your professional profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Low', 'Medium', 'High'] as const).map(risk => (
              <button
                key={risk}
                onClick={() => setRiskTolerance(risk)}
                className={`p-4 rounded-lg border-2 transition ${
                  riskTolerance === risk
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">{risk} Risk</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {risk === 'Low' && 'Fixed Deposits, Bonds, PPF - Stable returns'}
                  {risk === 'Medium' && 'Balanced Funds, Blue-chip Stocks - Growth + Safety'}
                  {risk === 'High' && 'Equity Funds, Small-cap Stocks - Maximum growth'}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-purple-600 mr-2" />
            <p>Getting personalized recommendations for professionals...</p>
          </CardContent>
        </Card>
      )}

      {recommendations && !loading && (
        <>
          {/* AI Overall Advice */}
          <Alert className="bg-blue-50 border-blue-200">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              {recommendations.overallAdvice}
            </AlertDescription>
          </Alert>

          {/* Investment Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Investments</CardTitle>
              <CardDescription>Personalized for professionals with your income level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.recommendations.map((rec, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:bg-secondary transition">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-lg">{rec.title}</p>
                        <p className="text-sm text-muted-foreground">{rec.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.riskLevel === 'Low'
                          ? 'bg-green-100 text-green-800'
                          : rec.riskLevel === 'Medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rec.riskLevel} Risk
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>

                    <div className="grid grid-cols-3 gap-4 p-3 bg-secondary rounded text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Return</p>
                        <p className="font-semibold text-green-600">{rec.expectedReturn}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Min. Investment</p>
                        <p className="font-semibold">₹{rec.minInvestment.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Why Recommended</p>
                        <p className="font-semibold text-xs">{rec.reason.substring(0, 30)}...</p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">Explore {rec.title}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tax-Saving Strategies */}
          <Card>
            <CardHeader>
              <CardTitle>Tax-Saving Strategies</CardTitle>
              <CardDescription>Strategic investment approach for professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.taxSavingStrategies.map((strategy, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">{strategy.section}</p>
                        <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        <p className="text-sm font-semibold text-green-600 mt-2">
                          💰 Potential Savings: ₹{strategy.potentialSavings.toLocaleString('en-IN')}/year
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}