'use client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/lib/languageContext';
import { translateBatch } from '@/lib/translation';
import { useState, useEffect } from 'react';

export default function LoanAnalytics({ loans }) {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const translateContent = async () => {
      const translated = await translateBatch([
        'Loan Analytics',
        'Total Loans',
        'Active Loans',
        'Monthly EMI',
        'Loan Distribution',
        'EMI Timeline',
        'Loan Types',
        'Amount Distribution'
      ], language);

      setTranslations({
        title: translated[0],
        totalLoans: translated[1],
        activeLoans: translated[2],
        monthlyEmi: translated[3],
        distribution: translated[4],
        timeline: translated[5],
        types: translated[6],
        amountDist: translated[7]
      });
    };

    translateContent();
  }, [language]);

  // Update the colors to match theme
  const COLORS = ['#10B981', '#14B8A6', '#0EA5E9', '#8B5CF6', '#EC4899'];

  const loanTypeData = loans.reduce((acc, loan) => {
    acc[loan.loan_type] = (acc[loan.loan_type] || 0) + Number(loan.loan_amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(loanTypeData).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyPayments = loans.map(loan => ({
    name: loan.loan_type,
    amount: Number(loan.emi_amount)
  }));

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="border-emerald-200/50">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-200">{translations.title || 'Loan Analytics'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution">
          <TabsList className="grid w-full grid-cols-2 bg-emerald-100/50 dark:bg-emerald-900/50">
            <TabsTrigger 
              value="distribution"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              {translations.distribution || 'Distribution'}
            </TabsTrigger>
            <TabsTrigger 
              value="emi"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              {translations.monthlyEmi || 'Monthly EMIs'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="distribution" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="emi" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPayments}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
