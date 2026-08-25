Shadowverse 戦績管理 + Card DB 統合版 (prototype 1)

追加内容
- 既存の戦績・環境・デッキURL登録機能を維持
- cardData を統合
- デッキ登録時に「画像URL」「カード40枚で作成」を選択可能
- カード構築は同一カード最大3枚、合計40枚
- 名前/能力、パック、クラス、コスト、タイプで絞り込み
- 選択したクラス + ニュートラルをカード候補に表示
- デッキ選択、対戦登録、結果画面では、構築デッキの場合カード画像一覧を表示

注意
- cardData は fetch で読むため、GitHub Pages 上での利用を想定しています。
- 既存デッキは deckType が無くても URL デッキとしてそのまま表示されます。
- deck_edit.html は既存編集画面を維持しています。構築済み40枚の再編集UIは次段階で追加できます。

Self-check v1.2: inline JavaScript syntax, JSON parsing, local static paths, original-page diff scope checked.
