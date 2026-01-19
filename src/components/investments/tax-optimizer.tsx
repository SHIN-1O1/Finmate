'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Investment, TaxSaving } from '@/lib/investment-types';
import { UserProfile } from '@/lib/types';
import { AlertCircle, Target, CheckCircle } from 'lucide-react';

interface TaxOptimizerProps {
  investments: Investment[];
  profile?: UserProfile;
}

const taxSavingOptions: TaxSaving[] = [
  {
    id: '80c-1',
    category: '80C',
    section: 'Life Insurance Premium',
    description: 'Life Insurance Premium payments',
    maxLimit: 150000,
    currentAmount: 0,
    recommendedInvestment: 'ULIP, Term Insurance',
    benefitPerYear: 0,
  },
  {
    id: '80c-2',
    category: '80C',
    section: 'ELSS (Equity Linked Saving Scheme)',
    description: 'Equity Linked Saving Schemes with 3-year lock-in',
    maxLimit: 150000,
    currentAmount: 0,
    recommendedInvestment: 'ELSS Mutual Funds',
    benefitPerYear: 0,
  },
  {
    id: '80c-3',
    category: '80C',
    section: 'PPF (Public Provident Fund)',
    description: 'Public Provident Fund contributions (15-year maturity)',
    maxLimit: 150000,
    currentAmount: 0,
    recommendedInvestment: 'PPF Accounts',
    benefitPerYear: 0,
  },
  {
    id: '80c-4',
    category: '80C',
    section: 'Fixed Deposit (5 years)',
    description: 'Tax-saving Fixed Deposits with 5-year lock-in',
    maxLimit: 150000,
    currentAmount: 0,
    recommendedInvestment: 'Bank FDs',
    benefitPerYear: 0,
  },
  {
    id: '80c-5',
    category: '80C',
    section: 'Corporate Bonds',
    description: 'Tax-saving Bonds from PSUs and corporates',
    maxLimit: 150000,
    currentAmount: 0,
    recommendedInvestment: 'Corporate/PSU Bonds',
    benefitPerYear: 0,
  },
  {
    id: '80d',
    category: '80D',
    section: 'Health Insurance Premium',
    description: 'Health and Mediclaim Insurance (₹50,000 for self + family)',
    maxLimit: 50000,
    currentAmount: 0,
    recommendedInvestment: 'Health Insurance Policy',
    benefitPerYear: 0,
  },
  {
    id: '80e',
    category: '80E',
    section: 'Education Loan Interest',
    description: 'Interest on education loans (no upper limit)',
    maxLimit: 0,
    currentAmount: 0,
    recommendedInvestment: 'Education Loan',
    benefitPerYear: 0,
  },
  {
    id: 'nps',
    category: 'NPS',
    section: 'National Pension Scheme',
    description: 'NPS contributions (additional ₹50,000 under 80CCD(1B))',
    maxLimit: 50000,
    currentAmount: 0,
    recommendedInvestment: 'NPS Account',
    benefitPerYear: 0,
  },
  {
    id: '80g',
    category: '80G',
    section: 'Charitable Donations',
    description: 'Donations to approved charitable organizations',
    maxLimit: 0,
    currentAmount: 0,
    recommendedInvestment: 'Charity/NGO',
    benefitPerYear: 0,
  },
];

export default function TaxOptimizer({ investments, profile }: TaxOptimizerProps) {
  const [taxSavings, setTaxSavings] = useState<TaxSaving[]>(taxSavingOptions);
  const [totalTaxBenefit, setTotalTaxBenefit] = useState(0);

  useEffect(() => {
    // Calculate current amounts based on investments
    const updated = taxSavingOptions.map(tax => {
      let currentAmount = 0;

      if (tax.category === '80C') {
        if (tax.section === 'ELSS (Equity Linked Saving Scheme)') {
          currentAmount = investments
            .filter(inv => inv.type === 'Mutual Fund' && inv.name.includes('ELSS'))
            .reduce((sum, inv) => sum + inv.purchaseAmount, 0);
        } else if (tax.section.includes('Deposit')) {
          currentAmount = investments
            .filter(inv => inv.type === 'Fixed Deposit')
            .reduce((sum, inv) => sum + inv.purchaseAmount, 0);
        }
      }

      const benefit = profile ? Math.round((currentAmount * 0.3) / 100) : 0;

      return {
        ...tax,
        currentAmount,
        benefitPerYear: benefit,
      };
    });

    setTaxSavings(updated);

    // Calculate total tax benefit (assuming 30% slab for professionals)
    const total = updated.reduce((sum, tax) => sum + tax.benefitPerYear, 0);
    setTotalTaxBenefit(total);
  }, [investments, profile]);

  const totalInvested = taxSavings.reduce((sum, tax) => sum + tax.currentAmount, 0);
  const annualTaxableIncome = profile?.income ? profile.income * 12 : 0;
  const effectiveTaxRate = annualTaxableIncome > 0 ? (totalTaxBenefit / annualTaxableIncome) * 100 : 0;

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Professional tip: Plan tax-saving investments early in the financial year to maximize deductions and reduce taxable income.
        </AlertDescription>
      </Alert>

      {/* Tax Benefit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Tax-Saved Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Invested in tax-saving instruments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Annual Tax Benefit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalTaxBenefit.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">{effectiveTaxRate.toFixed(2)}% of income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Section 80C Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalInvested / 150000) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Out of ₹1,50,000 limit</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax-Saving Options */}
      <Card>
        <CardHeader>
          <CardTitle>Tax-Saving Investment Options</CardTitle>
          <CardDescription>Maximize your tax benefits with these instruments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxSavings.map(tax => (
            <div key={tax.id} className="border rounded-lg p-4 hover:bg-secondary transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                      {tax.category}
                    </span>
                    <p className="font-semibold">{tax.section}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{tax.description}</p>
                </div>
                {tax.currentAmount > 0 && <CheckCircle className="w-5 h-5 text-green-600" />}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-secondary rounded text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Annual Limit</p>
                  <p className="font-semibold">{tax.maxLimit === 0 ? 'No Limit' : `₹${tax.maxLimit.toLocaleString('en-IN')}`}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Amount</p>
                  <p className="font-semibold">₹{tax.currentAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tax Benefit/Year</p>
                  <p className="font-semibold text-green-600">₹{tax.benefitPerYear.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                💡 {tax.recommendedInvestment}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Expert Tips for Professionals */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Professional Tax Optimization Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2 text-sm">
          <p>✅ Use 80C limit efficiently: Combine ELSS + PPF + Life Insurance</p>
          <p>✅ ELSS offers best returns (12-15% avg) with tax benefits - ideal for professionals</p>
          <p>✅ Maximize NPS: ₹1,50,000 under 80C + ₹50,000 under 80CCD(1B) = ₹2,00,000 total</p>
          <p>✅ Don't skip health insurance: Covers self + family up to ₹50,000 deduction</p>
          <p>✅ Consider corporate bonds: Low risk, stable returns, tax-saving potential</p>
          <p>✅ Home loan interest: Deduction up to ₹2,00,000 per year (Section 24(b))</p>
          <p>✅ Plan quarterly: Review portfolio and adjust before December 31st</p>
        </CardContent>
      </Card>
    </div>
  );
}