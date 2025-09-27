import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Plus, Edit, Trash2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Destination {
  id: string;
  name: string;
  region: string;
  description?: string;
  images: string[];
  attractions: string[];
  weather: string;
  popularity: number;
  created_at: string;
  updated_at: string;
}

export const DestinationManagement: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [newDestination, setNewDestination] = useState({
    name: '',
    region: '',
    description: '',
    images: [] as string[],
    attractions: [] as string[],
    weather: '',
    popularity: 0
  });
  const [attractionInput, setAttractionInput] = useState('');
  const [imageInput, setImageInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch destinations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = async () => {
    try {
      const { error } = await supabase
        .from('destinations')
        .insert([newDestination]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Destination added successfully",
      });
      
      setNewDestination({
        name: '',
        region: '',
        description: '',
        images: [],
        attractions: [],
        weather: '',
        popularity: 0
      });
      setIsAddDialogOpen(false);
      fetchDestinations();
    } catch (error) {
      console.error('Error adding destination:', error);
      toast({
        title: "Error",
        description: "Failed to add destination",
        variant: "destructive",
      });
    }
  };

  const handleEditDestination = async () => {
    if (!editingDestination) return;

    try {
      const { error } = await supabase
        .from('destinations')
        .update(editingDestination)
        .eq('id', editingDestination.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Destination updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setEditingDestination(null);
      fetchDestinations();
    } catch (error) {
      console.error('Error updating destination:', error);
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDestination = async (destinationId: string) => {
    try {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destinationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Destination deleted successfully",
      });
      
      fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast({
        title: "Error",
        description: "Failed to delete destination",
        variant: "destructive",
      });
    }
  };

  const addAttraction = () => {
    if (attractionInput.trim()) {
      setNewDestination({
        ...newDestination,
        attractions: [...newDestination.attractions, attractionInput.trim()]
      });
      setAttractionInput('');
    }
  };

  const removeAttraction = (index: number) => {
    setNewDestination({
      ...newDestination,
      attractions: newDestination.attractions.filter((_, i) => i !== index)
    });
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setNewDestination({
        ...newDestination,
        images: [...newDestination.images, imageInput.trim()]
      });
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setNewDestination({
      ...newDestination,
      images: newDestination.images.filter((_, i) => i !== index)
    });
  };

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.weather.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPopularityBadgeVariant = (popularity: number) => {
    if (popularity >= 80) return 'default';
    if (popularity >= 60) return 'secondary';
    if (popularity >= 40) return 'outline';
    return 'secondary';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading destinations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Destination Management
          </CardTitle>
          <CardDescription>
            Manage tourist destinations and attractions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Destination
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Destination</DialogTitle>
                  <DialogDescription>
                    Add a new tourist destination to the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Destination Name</Label>
                      <Input
                        id="name"
                        value={newDestination.name}
                        onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                        placeholder="e.g., Hunza Valley"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region</Label>
                      <Input
                        id="region"
                        value={newDestination.region}
                        onChange={(e) => setNewDestination({ ...newDestination, region: e.target.value })}
                        placeholder="e.g., Gilgit-Baltistan"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newDestination.description}
                      onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })}
                      placeholder="Describe the destination..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weather">Weather</Label>
                      <Input
                        id="weather"
                        value={newDestination.weather}
                        onChange={(e) => setNewDestination({ ...newDestination, weather: e.target.value })}
                        placeholder="e.g., Mild and pleasant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="popularity">Popularity (0-100)</Label>
                      <Input
                        id="popularity"
                        type="number"
                        min="0"
                        max="100"
                        value={newDestination.popularity}
                        onChange={(e) => setNewDestination({ ...newDestination, popularity: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Attractions</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={attractionInput}
                        onChange={(e) => setAttractionInput(e.target.value)}
                        placeholder="Add an attraction"
                        onKeyPress={(e) => e.key === 'Enter' && addAttraction()}
                      />
                      <Button type="button" onClick={addAttraction}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newDestination.attractions.map((attraction, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeAttraction(index)}>
                          {attraction} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Images</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={imageInput}
                        onChange={(e) => setImageInput(e.target.value)}
                        placeholder="Add image URL"
                        onKeyPress={(e) => e.key === 'Enter' && addImage()}
                      />
                      <Button type="button" onClick={addImage}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newDestination.images.map((image, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeImage(index)}>
                          Image {index + 1} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDestination}>Add Destination</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destination</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Weather</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Attractions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDestinations.map((destination) => (
                <TableRow key={destination.id}>
                  <TableCell className="font-medium">{destination.name}</TableCell>
                  <TableCell>{destination.region}</TableCell>
                  <TableCell>{destination.weather}</TableCell>
                  <TableCell>
                    <Badge variant={getPopularityBadgeVariant(destination.popularity)}>
                      {destination.popularity}/100
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {destination.attractions.slice(0, 2).map((attraction, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {attraction}
                          </Badge>
                        ))}
                        {destination.attractions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{destination.attractions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(destination.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingDestination(destination);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the destination.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDestination(destination.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Destination Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription>
              Update destination information.
            </DialogDescription>
          </DialogHeader>
          {editingDestination && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Destination Name</Label>
                  <Input
                    id="edit-name"
                    value={editingDestination.name}
                    onChange={(e) => setEditingDestination({ ...editingDestination, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-region">Region</Label>
                  <Input
                    id="edit-region"
                    value={editingDestination.region}
                    onChange={(e) => setEditingDestination({ ...editingDestination, region: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingDestination.description || ''}
                  onChange={(e) => setEditingDestination({ ...editingDestination, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-weather">Weather</Label>
                  <Input
                    id="edit-weather"
                    value={editingDestination.weather}
                    onChange={(e) => setEditingDestination({ ...editingDestination, weather: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-popularity">Popularity (0-100)</Label>
                  <Input
                    id="edit-popularity"
                    type="number"
                    min="0"
                    max="100"
                    value={editingDestination.popularity}
                    onChange={(e) => setEditingDestination({ ...editingDestination, popularity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDestination}>Update Destination</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
