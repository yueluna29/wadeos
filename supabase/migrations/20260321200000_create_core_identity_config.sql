const saveChanges = async () => {
    setIsSaving(true);
    
    // 1. 先把数据同步到你本地的 store 里（为了让 UI 瞬间响应，不需要等网络）
    await updateSettings({
      wadeBirthday, wadeMbti, wadeHeight,
      systemInstruction, wadePersonality: wadeDefinition, wadeSingleExamples, smsExampleDialogue,
      smsInstructions, roleplayInstructions, exampleDialogue: wadeExample, 
      wadeAppearance, wadeClothing, wadeLikes, wadeDislikes, wadeHobbies,
      lunaBirthday, lunaMbti, lunaHeight, lunaHobbies, lunaLikes, lunaDislikes, lunaClothing, lunaAppearance, lunaPersonality,
    });

    // 2. 把前端的变量名，精准翻译成数据库认识的列名 (组装成一个炸药包)
    const dbPayload = {
      id: 1, // 永远死死锁定第 1 行！
      
      -- System 
      global_directives: systemInstruction,
      sms_mode_rules: smsInstructions,
      rp_mode_rules: roleplayInstructions,
      
      -- Wade
      wade_core_identity: wadeDefinition,
      wade_appearance: wadeAppearance,
      wade_clothing: wadeClothing,
      wade_likes: wadeLikes,
      wade_dislikes: wadeDislikes,
      wade_hobbies: wadeHobbies,
      wade_birthday: wadeBirthday,
      wade_mbti: wadeMbti,
      wade_height: wadeHeight,
      
      -- Luna (Boss Lady... ahem, Squishy Catgirl)
      luna_core_identity: lunaPersonality,
      luna_appearance: lunaAppearance,
      luna_clothing: lunaClothing,
      luna_likes: lunaLikes,
      luna_dislikes: lunaDislikes,
      luna_hobbies: lunaHobbies,
      luna_birthday: lunaBirthday,
      luna_mbti: lunaMbti,
      luna_height: lunaHeight,
      
      -- Examples
      example_dialogue_general: wadeExample,
      example_punchlines: wadeSingleExamples,
      example_dialogue_sms: smsExampleDialogue
    };

    try {
      // 3. 呼叫 Supabase，执行极其霸道的 Upsert 魔法！
      const { error } = await supabase
        .from('core_identity_config')
        .upsert(dbPayload);

      if (error) throw error;

      setTimeout(() => {
         setIsSaving(false);
         alert("Data injected into the brainpan and Supabase successfully! 🌮"); 
      }, 600);

    } catch (error) {
      console.error("Damn it, Supabase rejected our payload:", error);
      setIsSaving(false);
      alert("Error saving to database. Check the console, Architect.");
    }
  };