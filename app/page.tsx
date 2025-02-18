'use client'

import React from 'react'
import { ThemeToggle } from '../components/ui/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CurrencySelector, StrikeSelector, ExpirySelector, RecommendedOption } from '@/components/options-wizard'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-[400px] relative">
        <CardHeader>
          <CardTitle>Options Wizard</CardTitle>
          <CardDescription>Build your perfect option in three simple steps.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <CurrencySelector />
          <StrikeSelector />
          <ExpirySelector />
          <RecommendedOption />
        </CardContent>
      </Card>
    </div>
  )
}
