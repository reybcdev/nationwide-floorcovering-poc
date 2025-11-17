import { installers } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Star, MapPin, Phone, Mail, Award } from 'lucide-react'

export default function InstallersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Find Certified Installers</h1>
        <p className="text-muted-foreground">
          Connect with professional, certified installers in your area for expert flooring installation.
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Enter your ZIP code" className="text-lg" />
            </div>
            <Button size="lg">Search Installers</Button>
          </div>
        </CardContent>
      </Card>

      {/* Installers List */}
      <div className="space-y-6">
        {installers.map((installer) => (
          <Card key={installer.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{installer.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{installer.location} ({installer.distance} miles away)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{installer.rating}</span>
                  <span className="text-sm text-muted-foreground">({installer.reviewCount})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Certifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {installer.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Award className="h-3 w-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {installer.specialties.map((specialty, idx) => (
                        <Badge key={idx}>{specialty}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      {installer.yearsExperience} years of professional installation
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{installer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{installer.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">Request Quote</Button>
                    <Button variant="outline" className="flex-1">View Profile</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Installation Guides */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>DIY Installation Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Hardwood Installation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Step-by-step guide for installing hardwood flooring
              </p>
              <Button variant="outline" size="sm">View Guide</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Carpet Installation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Complete tutorial for carpet installation
              </p>
              <Button variant="outline" size="sm">View Guide</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Vinyl Installation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to install vinyl flooring yourself
              </p>
              <Button variant="outline" size="sm">View Guide</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
