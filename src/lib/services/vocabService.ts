import { supabase } from "@/lib/supabaseClient";
import { VOCABULARY_DATA, VocabularyWord } from "../data/vocabularyData";

export class VocabService {
  /**
   * Fetches the current 5 rotated words for the user.
   */
  static async getDailyWordsAsync(): Promise<VocabularyWord[]> {
    try {
      const { getCurrentRotatedContent, triggerRefreshIfNeeded } = await import("./refreshContent");
      
      await triggerRefreshIfNeeded();
      const rotated = await getCurrentRotatedContent();
      
      if (!rotated || !rotated.vocabularyIds || rotated.vocabularyIds.length === 0) {
        return VOCABULARY_DATA.slice(0, 5);
      }

      return rotated.vocabularyIds
        .map(id => VOCABULARY_DATA.find(v => v.id === id))
        .filter(Boolean) as VocabularyWord[];
    } catch (err) {
      console.error("VocabService: Error fetching daily words", err);
      return VOCABULARY_DATA.slice(0, 5);
    }
  }

  /**
   * Fetches all words saved by the user.
   */
  static async getSavedWordsAsync(): Promise<VocabularyWord[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data } = await supabase
      .from('saved_words')
      .select('word_id')
      .eq('user_id', session.user.id);

    if (!data) return [];

    const savedIds = data.map(d => d.word_id);
    return VOCABULARY_DATA.filter(v => savedIds.includes(v.id));
  }

  /**
   * Fetches words marked as learned.
   */
  static async getLearnedWordIds(): Promise<string[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data } = await supabase
      .from('user_word_progress')
      .select('word_id')
      .eq('user_id', session.user.id)
      .eq('status', 'learned');

    return data?.map(d => d.word_id) || [];
  }
}
