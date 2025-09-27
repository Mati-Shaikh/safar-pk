import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export const DebugData: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      console.log('Supabase test connection:', { testData, testError });

      // Test each table
      const tables = ['user_profiles', 'destinations', 'hotels', 'hotel_rooms', 'vehicles', 'trips', 'bookings'];
      const results: any = {};

      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(5);

          results[table] = {
            success: !error,
            error: error?.message,
            count: count || 0,
            sampleData: data?.slice(0, 2) || []
          };
        } catch (err) {
          results[table] = {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error',
            count: 0,
            sampleData: []
          };
        }
      }

      setDebugInfo({
        connection: { testData, testError },
        tables: results
      });

    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Debug Data Connection</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testSupabaseConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Supabase Connection'}
        </Button>
        
        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Results:</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
