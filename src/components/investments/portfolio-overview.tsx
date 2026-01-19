'use client';

import { Investment, SIPPlan } from '@/lib/investment-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PortfolioOverviewProps {
  investments: Investment[];
  sipPlans: SIPPlan[];
}

export default function PortfolioOverview({ investments, sipPlans }: PortfolioOverviewProps) {
  const investmentsByType = investments.reduce((acc, inv) => {
    const existing = acc.find(item => item.name === inv.type);
    if (existing) {
      existing.value += inv.currentValue;
      existing.count += 1;
    } else {
      acc.push({ name: inv.type, value: inv.currentValue, count: 1 });
    }
    return acc;
  }, [] as { name: string; value: number; count: number }[]);

  const performanceData = investments.map(inv => ({
    name: inv.name.substring(0, 10),
    invested: inv.purchaseAmount,
    current: inv.currentValue,
    gain: inv.currentValue - inv.purchaseAmount,
  }));

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
          <CardDescription>Distribution of your investments across different asset classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {investmentsByType.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={investmentsByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {investmentsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {investmentsByType.map((type, idx) => (
                    <div key={type.name} className="flex items-center justify-between p-2 rounded hover:bg-secondary">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-sm font-medium">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{type.value.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground">{type.count} investment{type.count > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No investments added yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Investment Performance */}
      {performanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Investment Performance</CardTitle>
            <CardDescription>Comparing invested amount vs current value</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend />
                <Bar dataKey="invested" fill="#8b5cf6" name="Invested Amount" />
                <Bar dataKey="current" fill="#10b981" name="Current Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
          <CardDescription>Detailed view of all your investments</CardDescription>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No investments added yet. Start building your portfolio!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Invested</TableHead>
                  <TableHead>Current Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  <TableHead>Return %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map(inv => {
                  const gain = inv.currentValue - inv.purchaseAmount;
                  const returnPct = (gain / inv.purchaseAmount) * 100;
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.name}</TableCell>
                      <TableCell>{inv.type}</TableCell>
                      <TableCell>₹{inv.purchaseAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{inv.currentValue.toLocaleString('en-IN')}</TableCell>
                      <TableCell className={gain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ₹{gain.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className={returnPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {returnPct.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Active SIPs */}
      {sipPlans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active SIP Plans</CardTitle>
            <CardDescription>Your Systematic Investment Plans</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Monthly Amount</TableHead>
                  <TableHead>Fund Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sipPlans.filter(sip => sip.isActive).map(sip => (
                  <TableRow key={sip.id}>
                    <TableCell className="font-medium">{sip.name}</TableCell>
                    <TableCell>₹{sip.monthlyAmount.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{sip.fundType}</TableCell>
                    <TableCell>{new Date(sip.startDate).toLocaleDateString()}</TableCell>
                    <TableCell><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}