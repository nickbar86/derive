'use client'

import React from 'react'
import { ThemeToggle } from '../components/ui/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CurrencySelector, StrikeSelector, ExpirySelector, PayoffMatrix, RecommendedOption } from '@/components/options-wizard'
import { OptionsWizardProvider } from '@/components/options-wizard/context'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <OptionsWizardProvider>
        <Card className="w-full max-w-[1000px]">
          <CardHeader>
            <CardTitle>Options Wizard</CardTitle>
            <CardDescription>Build your perfect option in three simple steps.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-6">
                <CurrencySelector />
                <StrikeSelector />
                <ExpirySelector />
                <RecommendedOption />
              </div>
              <div className="flex flex-col gap-6">
                <PayoffMatrix />
              </div>
            </div>
          </CardContent>
        </Card>
      </OptionsWizardProvider>
    </div>
  )
}
