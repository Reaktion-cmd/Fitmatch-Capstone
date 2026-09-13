    import 'react-native-url-polyfill/auto';
    import AsyncStorage from '@react-native-async-storage/async-storage';
    import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tunbfahorohulcazrcfm.supabase.co';
const supabaseAnonKey = 'sb_publishable_lVik06010k8jgj_vKDZj3g_ptfnUK69';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
