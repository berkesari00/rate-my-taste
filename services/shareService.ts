import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { ShareCardData } from '../components/ShareCard';

export async function shareAnalysis(
  viewRef: React.RefObject<any>,
  data: ShareCardData
): Promise<void> {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Rate My Taste sonucunu paylaş',
        UTI: 'public.png',
      });
    } else {
      throw new Error('Bu cihazda paylaşım desteklenmiyor.');
    }
  } catch (e: any) {
    throw new Error(e?.message || 'Paylaşım başarısız oldu.');
  }
}