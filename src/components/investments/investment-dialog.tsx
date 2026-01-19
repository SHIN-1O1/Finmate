'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Investment, InvestmentType, InvestmentStatus } from '@/lib/investment-types';

interface InvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (investment: Investment) => void;
}

const investmentTypes: InvestmentType[] = ['Stock', 'Mutual Fund', 'SIP', 'Cryptocurrency', 'Bonds', 'Fixed Deposit', 'Gold', 'Real Estate'];

export default function InvestmentDialog({ open, onOpenChange, onSave }: InvestmentDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Mutual Fund');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const investment: Investment = {
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      type,
      purchaseAmount,
      currentValue: currentValue || purchaseAmount,
      purchaseDate,
      status: 'Active' as InvestmentStatus,
      notes,
    };

    onSave(investment);
    
    // Reset form
    setName('');
    setType('Mutual Fund');
    setPurchaseAmount(0);
    setCurrentValue(0);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
          <DialogDescription>
            Enter the details of your investment to track it in your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Investment Name</Label>
            <Input
              id="name"
              placeholder="e.g., HDFC Balanced Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Investment Type</Label>
            <Select value={type} onValueChange={(value: string) => setType(value as InvestmentType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {investmentTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseAmount">Purchase Amount (₹)</Label>
              <Input
                id="purchaseAmount"
                type="number"
                placeholder="0"
                value={purchaseAmount || ''}
                onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">Current Value (₹)</Label>
              <Input
                id="currentValue"
                type="number"
                placeholder="0"
                value={currentValue || ''}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Investment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
