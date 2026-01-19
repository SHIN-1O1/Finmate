'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SIPPlan } from '@/lib/investment-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { v4 as uuidv4 } from 'uuid';

interface SIPCalculatorProps {
  sipPlans: SIPPlan[];
  onAddSIP: (plan: SIPPlan) => void;
}

export default function SIPCalculator({ sipPlans, onAddSIP }: SIPCalculatorProps) {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [years, setYears] = useState(5);
  const [investmentType, setInvestmentType] = useState<'Mutual Fund' | 'Stock' | 'Gold'>('Mutual Fund');
  const [results, setResults] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const calculateSIP = () => {
    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;
    let totalInvested = 0;
    let futureValue = 0;

    const data = [];
    let currentValue = 0;

    for (let month = 1; month <= months; month++) {
      totalInvested += monthlyAmount;
      currentValue = currentValue * (1 + monthlyRate) + monthlyAmount;

      if (month % 12 === 0) {
        data.push({
          month: `Year ${month / 12}`,
          invested: totalInvested,
          value: Math.round(currentValue),
        });
      }
    }

    futureValue = currentValue;
    const gains = futureValue - totalInvested;

    setResults({
      investedAmount: totalInvested,
      futureValue: Math.round(futureValue),
      totalGains: Math.round(gains),
      gainPercentage: ((gains / totalInvested) * 100).toFixed(2),
    });

    setChartData(data);
  };

  useEffect(() => {
    calculateSIP();
  }, [monthlyAmount, annualReturn, years]);

  const handleAddSIP = () => {
    const newSIP: SIPPlan = {
      id: uuidv4(),
      name: `${investmentType} SIP - ₹${monthlyAmount}`,
      monthlyAmount,
      fundType: investmentType,
      startDate: new Date().toISOString(),
      isActive: true,
      contributions: [],
      expectedMaturityDate: new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000).toISOString(),
      targetAmount: results?.futureValue,
    };

    onAddSIP(newSIP);
    alert('SIP Plan added successfully!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SIP Calculator</CardTitle>
          <CardDescription>Calculate your Systematic Investment Plan returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly">Monthly Investment</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">₹{monthlyAmount.toLocaleString('en-IN')}</p>
            </div>

            <div>
              <Label htmlFor="annual">Expected Annual Return (%)</Label>
              <Input
                id="annual"
                type="number"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">{annualReturn}% per annum</p>
            </div>

            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="type">Fund Type</Label>
              <Select value={investmentType} onValueChange={(value: any) => setInvestmentType(value)}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
                  <SelectItem value="Stock">Stock</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {results && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Invested Amount</p>
                <p className="text-lg font-bold">₹{results.investedAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Future Value</p>
                <p className="text-lg font-bold text-green-600">₹{results.futureValue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Gains</p>
                <p className="text-lg font-bold text-green-600">₹{results.totalGains.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Return %</p>
                <p className="text-lg font-bold text-green-600">{results.gainPercentage}%</p>
              </div>
            </div>
          )}

          <Button onClick={handleAddSIP} className="w-full">
            Create This SIP Plan
          </Button>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Line type="monotone" dataKey="invested" stroke="#8b5cf6" name="Invested Amount" />
                <Line type="monotone" dataKey="value" stroke="#10b981" name="Future Value" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {sipPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your SIP Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sipPlans.map(plan => (
                <div key={plan.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">Started: {new Date(plan.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}