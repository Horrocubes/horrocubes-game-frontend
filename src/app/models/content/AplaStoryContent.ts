/**
 * @file Story.ts
 *
 * @author Angel Castillo <angel.castillo@horrocubes.io>
 * @date   Dec 10 2021
 *
 * @copyright Copyright 2021 Horrocubes.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* IMPROTS *******************************************************************/

import { Reward } from '../Reward';

/* EXPORTS *******************************************************************/

/**
 * The alpha story content model.
 */
export class AplaStoryContent
{
     getStoryTitle()
     {
        return "Alpha Test";
     }

     getLevelName(index: number)
     {
         if (index === 0)
            return "Welcome";

        if (index === 1)
            return "An Unconventional Warning";

        if (index === 2)
            return "1000 followers on Twitter";

        if (index === 3)
            return "Oneiromancy";
     }

     getLevelHint(index: number)
     {
         if (index === 0)
            return "Rotate by 13 places, sometimes hyphenated ROT-13, is a simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet. ROT13 is a special case of the Caesar cipher which was developed in ancient Rome.";

        if (index === 1)
            return "Father Agustine became headlines on several newspapers after he and the whole crew of the Santa Barbara were declared missing in 1879. They were supposed to set camp on the Nololuk island and come back after a few months to report the situation, get supplies and transport the second batch of personal. They never returned. A search crew was dispatched to look for them several months after. But nor the Santa Barbara nor the island could be ever be found. To add to the mistery was the fact that several of father Agustine notes  from his time on the island started to emerge on the mainland, could he and the crew  somehow return to safety? but why didn't they contact the authorities? 109 souls were on board the Santa Barbara. Despite the very likely possibility that the notes could be fake, several scholars examined them. Regarding this particular entry in the diary, they all could agree on something: If the circles and dots are some sort of  encoding method, it can not represent all symbols of the alphabet.";

        if (index === 2)
            return "No hints this time.";

        if (index === 3)
            return "Several scholars reviewed this entry in Father Agustine's diary. The page was full of small scribbles with sequences of words as if he was trying to organize his ideas, but he seemed too confused, disoriented. Many theories were put forward as to who had taken the Emerald; however, only one scholar (a scientist) was able to provide compelling evidence as to who had taken the Emerald, his answer was verified as correct at that time, but it seems it has now been lost to the ruthless pass of time.";
     }

     getLevelContent(index: number)
     {
         if (index === 0)
            return this.getFirstLevel();

        if (index === 1)
            return this.getSecondLevel();

        if (index === 2)
            return this.getThirdLevel();

        if (index === 3)
            return this.getFourthLevel();
     }

     getLevelRewards(index: number)
     {
        if (index === 0)
        return this.getFirstLevelReward();

    if (index === 1)
        return this.getSecondLevelReward();

    if (index === 2)
        return this.getThirdLevelReward();

    if (index === 3)
        return this.getFourthLevelReward();
     }

     getFirstLevelReward()
     {
        return new Reward(["Horrocoin x 1"],["https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/2000.png"]);
     }

     getSecondLevelReward()
     {
        return new Reward(["Horrocoin x 1"],["https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/2000.png"]);
     }

     getThirdLevelReward()
     {
        return new Reward(["Horrocoin x 1"],["https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/2000.png"]);
     }

     getFourthLevelReward()
     {
        return new Reward(["Horrocoin x 1", "Azathothian Pillar x 1", "Omens From a Reflection Poster x 1"] ,
        ["https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/2000.png",
        "https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/trophy.png",
        "https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/rewards/poster.png"]);
     }

     getFirstLevel()
     {
         let content;

         content = "<div class=\"container\">"+
         "<p>Jrypbzr gb gur Ubeebphorf Nycun. Ubeebphorf vf n chmmyr tnzr ehaavat ba gur Pneqnab oybpxpunva. Cynlref jvyy or vzzrefrq va n fgbel. Rnpu gvzr n chmmyr vf fbyirq, gur fgbel nqinaprf. Gur hygvzngr tbny vf gb haybpx nyy puncgref bs gur fgbel naq ernpu vgf pbapyhfvba.</p>"+
         "<p></p>"+
         "<p>Gur chmmyrf jvyy erdhver gur cynlre gb rzcybl qvssrerag grpuavdhrf: fgrtnabtencul, pelcgbtencul, naq yngreny guvaxvat naq jvyy vapernfr va qvssvphygl nf gur tnzr tbrf ba.</p>"+
         "<p>         </p>"+
         "<p>Rnpu yriry gur cynlre haybpxf erjneqf uvz jvgu rvgure genqrnoyr gbxraf be ASGf.</p>"+
         "<p>         </p>"+
         "<p>Gunaxf sbe urycvat hf grfg gur tnzr.</p>"+
         "<p>         </p>"+
         "<p>Gur fbyhgvba gb guvf chmmyr vf:</p>"+
         "<p>         </p>"+
         "<p>Ubeebphorf</p>"+
         "</div>";
         return content;
     }

     getSecondLevel()
     {
         let content;

         content = "<div class=\"container\">"+"<p style=\"text-align: justify;\">Today is the second of March of 1879 and my second week aboard this boat; the journey has been very uncomfortable, to say the least, as I am not used to sailing. I have been having trouble eating and sleeping. Recurrent nightmares keep haunting me at night; I have this dreams of a strange man wearing a faceless mask, every time he delivers me a piece of leather with a symbol made of circles and dots and then just stays there, I keep asking him who he is or what he wants, but to no avail, he never replies. I can&rsquo;t wait to get off this boat and set foot on solid land.</p>"+
         "<p style=\"text-align: justify;\">We are headed to unclaimed territory on an island in the pacific ocean. The island is inhabited by native people, self-identified as the Nololuk tribe. The first contact with the tribe was over ten years ago when a heavy storm deviated a British ship and ended up temporarily stranded. The explorers landed, and very quickly, some members of the tribe approached them. The tribesman showed curiosity at first; however, that curiosity became hostility very quickly. The British explorers had to flee the island, barely managing to repair enough of the damage on their ship to sail., but before they left, they kidnapped a kid and his mother. The mother died very soon after arriving on the mainland of a common disease; however, the kid survived; and now, ten years after his departure, he joins us in this expedition. He doesn&rsquo;t remember much of his time on the island. However, he still retains their language and will serve as a translator.</p>"+
         "<p style=\"text-align: justify;\">My mission on this journey is two folds. First, to bring salvation to these poor souls by showing them the true path to God. And second, to acculturate them to modern civilized norms.</p>"+
         "<p style=\"text-align: justify;\">I can already see the island approaching.</p>"+
         "<p style=\"text-align: justify;\">May God bless us all.</p>"+
         "<p style=\"text-align: justify;\">Father Howard Agustine.</p>"+
         "<p style=\"text-align: justify;\">&nbsp;</p>"+
         "<p style=\"text-align='center'\"><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/p1_.png\" alt=\"\" width=\"450\" height=\"400\" /></p>"+"</div>";
         return content;
     }


     getThirdLevel()
     {
         let content;

         content = "<div class=\"container\"><p style=\"text-align: justify;\">This puzzle will be a bit different. We wanted to do something to celebrate our 1000 followers on Twitter and Caos Creator created a Cardano logo in a twisted style. We have hidden two messages in the image. See if you can find them!.</p>"+
         "<p><strong>NOTE:</strong> You can go to the next puzzle by answering \"answer3\".</p>"+
         "<p>&nbsp;</p>"+
         "<p>&nbsp;</p>"+
         "<p><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/p2_.jpg\" alt=\"\" width=\"450\" height=\"450\" /></p>";
         return content;
     }

     getFourthLevel()
     {
         let content;

         content = "<div class=\"container\"><p style=\"text-align: justify;\"></p>"+
         "<p style=\"text-align: justify;\">Today is the third of March of 1879. We have already arrived on the island, we had to spend one more night on the ship as it was already too dark, but now we have started to set up camp.</p>"+
         "<p style=\"text-align: justify;\">I had one more of those nightmares last night, but this time it was changed, the masked figure was wearing black instead of yellow, in his hands, he was holding four precious gems and a piece of coal, he seemed to be offering them to me, but suddenly a flock of five ravens came in a took all of them, one each.</p>"+
         "<p style=\"text-align: justify;\">These were no regular ravens, one of them was blue and had twelve eyes, the one with a single eye took the piece of coal, the one with two eyes seemed sad at sight.</p>"+
         "<p style=\"text-align: justify;\">All of them had different colors, there was a golden raven standing to the left of a white raven, he looked afraid.</p>"+
         "<p style=\"text-align: justify;\">The Angry raven is next to the raven holding the Ruby.</p>"+
         "<p style=\"text-align: justify;\">They also all had different kinds of beaks, there was a raven with a wooden beak, he was holding one of the gems (the Jade), the black raven had a golden beak.</p>"+
         "<p style=\"text-align: justify;\">All ravens were standing in a neat row, the raven in the middle looked disappointed, the first raven from left to right had 3 eyes and the raven with the silver beak was standing next to the raven holding a diamond. The raven with the crystal beak was emotionless.</p>"+
         "<p style=\"text-align: justify;\">Weirdly enough there was a blind raven, he had a cooper beak. The 3 eye raven was standing next to the purple raven and the raven with the silver beak was standing next to the angry raven.</p>"+
         "<p style=\"text-align: justify;\">I have been trying to make sense of this nightmare since I woke up, I remember everything pretty vividly but for the life of me I can&rsquo;t remember and it is driving me crazy, <strong>who was holding the emerald?. </strong></p>"+
         "<p style=\"text-align: justify;\">Father Howard Agustine.</p>"+
         "<p style=\"text-align: justify;\">&nbsp;</p>"+
         "<p><img style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://storage.googleapis.com/horrocubes_web_assets/puzzle_alpha/p3_.png\" alt=\"\" width=\"450\" height=\"542\" /></p>";
         return content;
     }
 }
