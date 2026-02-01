'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, TrendingUp } from 'lucide-react';
import { Investment, SIPPlan } from '@/lib/investment-types';
import InvestmentDialog from '@/components/investments/investment-dialog';
import SIPCalculator from '@/components/investments/sip-calculator';
import TaxOptimizer from '@/components/investments/tax-optimizer';
import InvestmentRecommendations from '@/components/investments/investment-recommendations';
import PortfolioOverview from '@/components/investments/portfolio-overview';

export default function InvestmentsPage() {
  const { profile, updateInvestments, updateSIPPlans, deleteInvestment, deleteSIPPlan } = useApp();
  const [showInvestmentDialog, setShowInvestmentDialog] = useState(false);

  // Derive investments and SIP plans from profile
  const investments = profile?.investments || [];
  const sipPlans = profile?.sipPlans || [];

  const { portfolioValue, portfolioGain, gainPercentage } = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + inv.purchaseAmount, 0);
    const currentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const gain = currentValue - totalInvested;
    const percent = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

    return {
      portfolioValue: currentValue,
      portfolioGain: gain,
      gainPercentage: percent
    };
  }, [investments]);

  const handleAddInvestment = async (investment: Investment) => {
    await updateInvestments([...investments, investment]);
    setShowInvestmentDialog(false);
  };

  const handleAddSIP = async (plan: SIPPlan) => {
    await updateSIPPlans([...sipPlans, plan]);
  };

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading your investment portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Investments & Wealth</h1>
          <p className="text-muted-foreground">Track and grow your portfolio with AI-powered insights</p>
        </div>
        <Button onClick={() => setShowInvestmentDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Investment
        </Button>
      </div>

      <Alert className="bg-primary/5 border-primary/20">
        <TrendingUp className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary/90 font-medium">
          Welcome to your investment hub! Build long-term wealth with smart portfolio management and tax optimization.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="h-full border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">₹{portfolioValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Across {investments.length} holdings</p>
          </CardContent>
        </Card>

        <Card className="h-full border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className={`text-3xl font-bold ${portfolioGain >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              ₹{Math.abs(portfolioGain).toLocaleString('en-IN')}
            </div>
            <p className={`text-sm font-semibold ${gainPercentage >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {gainPercentage >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="h-full border-primary/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active SIPs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-3xl font-bold">{sipPlans.filter(s => s.isActive).length}</div>
            <p className="text-xs text-muted-foreground">Monthly commitment: ₹{sipPlans.filter(s => s.isActive).reduce((sum, s) => sum + s.monthlyAmount, 0).toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="overview">Portfolio</TabsTrigger>
          <TabsTrigger value="sip">SIP Calculator</TabsTrigger>
          <TabsTrigger value="tax">Tax Optimizer</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PortfolioOverview
            investments={investments}
            sipPlans={sipPlans}
            onDeleteInvestment={deleteInvestment}
            onDeleteSIP={deleteSIPPlan}
          />
        </TabsContent>

        <TabsContent value="sip" className="space-y-4">
          <SIPCalculator sipPlans={sipPlans} onAddSIP={handleAddSIP} />
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <TaxOptimizer investments={investments} profile={profile ?? undefined} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <InvestmentRecommendations profile={profile ?? undefined} investments={investments} />
        </TabsContent>
      </Tabs>

      <InvestmentDialog
        open={showInvestmentDialog}
        onOpenChange={setShowInvestmentDialog}
        onSave={handleAddInvestment}
      />

      {investments.length === 0 && sipPlans.length === 0 && (
        <Card className="text-center py-16 border-dashed bg-muted/20">
          <TrendingUp className="w-16 h-16 mx-auto text-primary/20 mb-4" />
          <CardTitle className="text-2xl">Your portfolio is empty</CardTitle>
          <CardDescription className="mt-2 mb-6 text-lg">
            Start building your wealth by adding your first investment or SIP.
          </CardDescription>
          <Button onClick={() => setShowInvestmentDialog(true)} size="lg" className="px-8 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Add First Investment
          </Button>
        </Card>
      )}
    </div>
  );
}