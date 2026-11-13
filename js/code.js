/*
 * 핵심 코드 조각 — 본인 작성 코드만 원문 그대로 발췌합니다.
 * 여러 구간을 이어 붙인 곳은 "// …"로 표시했고, url은 해당 커밋의 정확한 줄로 연결됩니다.
 *
 *   repo     : 프로젝트 저장소
 *   snippets : point = 해당 프로젝트 핵심 구현 번호(0부터), title, file, url, why(무엇을 보여주는 코드인지), code
 *
 * 작성자 확인: OverCooked2 · FURI · GearOfThree는 git blame으로 본인(jun / wjdwns) 커밋임을 확인했습니다.
 * InteReal은 Perforce에서 옮긴 저장소라 줄 단위 작성자 기록이 없어, 본인 Perforce 커밋 메시지(도면 생성 · 저장 · 네트워크 · 빛샘 수정)로 담당 범위를 확인했습니다.
 * Monster Hunter Wilds 모작은 Blueprint 프로젝트라 텍스트 코드가 없습니다.
 */
window.PORTFOLIO_CODE = {
  overcooked2: {
    repo: "https://github.com/PotenupDeaBak/OverCooked2",
    snippets: [
      {
        point: 0,
        title: "로컬에서 가장 가까운 대상 탐색",
        file: "Source/OverCooked2/Character/Component/OC2InteractionComponent.cpp",
        url: "https://github.com/PotenupDeaBak/OverCooked2/blob/cc447dc5cff4f0f8fe9ebcc62418bbe2bc6735e1/Source/OverCooked2/Character/Component/OC2InteractionComponent.cpp#L43-L108",
        why: "탐색과 하이라이트는 로컬 플레이어에서만 실행하고, 실제 상호작용은 ServerInteract RPC로 넘깁니다.",
        code: String.raw`void UOC2InteractionComponent::CheckInteract(USceneComponent* GrabPos)
{
    APawn* OwnerPawn = Cast<APawn>(GetOwner());
    if (OwnerPawn && OwnerPawn->GetController() && !OwnerPawn->IsLocallyControlled())
    {
        return;
    }
    // …
    TArray<FHitResult> HitResults;
    bool bHit = GetWorld()->SweepMultiByObjectType(
       HitResults,
       TraceLocation, TraceLocation,
       FQuat::Identity,
       ObjectQueryParams,
       FCollisionShape::MakeSphere(TraceRadius),
       QueryParams
    );

    if (bHit)
    {
       HitResults.Sort([TraceLocation](const FHitResult& A, const FHitResult& B) {
          return FVector::DistSquared(TraceLocation, A.GetActor()->GetActorLocation()) < FVector::DistSquared(TraceLocation, B.GetActor()->GetActorLocation());
       });

       AOC2BaseActor* ClosestActor = nullptr;
       for (const FHitResult& Hit : HitResults)
       {
           if (AActor* HitActor = Hit.GetActor())
           {
               if (AOC2BaseActor* Interactable = Cast<AOC2BaseActor>(HitActor))
               {
                   ClosestActor = Interactable;
                   break;
               }
           }
       }
       // … 이전 대상 하이라이트 해제 · 새 대상 하이라이트
    }
}`,
      },
      {
        point: 1,
        title: "서버 Tick에서만 조리 진행, 클라이언트는 OnRep으로 표시",
        file: "Source/OverCooked2/LevelContent/Cook/CookingVessel.cpp",
        url: "https://github.com/PotenupDeaBak/OverCooked2/blob/cc447dc5cff4f0f8fe9ebcc62418bbe2bc6735e1/Source/OverCooked2/LevelContent/Cook/CookingVessel.cpp#L123-L393",
        why: "조리 진행률과 상태 전이(조리 완료 → 과조리 → 불)는 HasAuthority인 서버 Tick에서만 계산하고, 클라이언트는 복제된 진행률을 OnRep에서 받아 게이지만 갱신합니다.",
        code: String.raw`    if (HasAuthority() && bIsOnStove && CurrentIngredient)
    {
        ProcessCooking(DeltaTime);
        UpdateVisuals(); 
    }
// …
void ACookingVessel::ProcessCooking(float DeltaTime)
{
    if (!CurrentIngredient) return;
    if (CurrentTable && CurrentTable->IsOnFire()) return;

    if (CurrentVesselState == ECookingVesselState::IDLE || CurrentVesselState == ECookingVesselState::COOKING)
    {
        CurrentVesselState = ECookingVesselState::COOKING;
        CookProgressRatio += (DeltaTime / CookDuration);
        
        if (CookProgressRatio >= 1.0f) 
        {
            CompleteCooking();
        }
    }
    else if (CurrentVesselState == ECookingVesselState::COOKED || CurrentVesselState == ECookingVesselState::COOKED_WARNING)
    {
        CurrentVesselState = ECookingVesselState::COOKED_WARNING;
        CookProgressRatio += (DeltaTime / OvercookDuration);
        
        if (CookProgressRatio >= 2.0f) 
        {
            OvercookIngredient();
        }
    }
}

void ACookingVessel::CompleteCooking()
{
    if (!CurrentIngredient) return;

    CookProgressRatio = 1.0f;
    CurrentVesselState = ECookingVesselState::COOKED;
    CookingCompletionTime = GetWorld()->GetTimeSeconds();
    
    
    CurrentIngredient->ChangeState(TargetIngredientState);
    
    if (ImCookedSound)
    {
        UGameplayStatics::PlaySound2D(GetWorld(), ImCookedSound);
    }

    UpdateVisuals();
    ForceNetUpdate();
}
// …
void ACookingVessel::OnRep_CookProgressRatio()
{
    UpdateVisuals();

    if (CachedWidgetPtr)
    {
        float Percent = FMath::Clamp(CookProgressRatio, 0.0f, 1.0f);
        CachedWidgetPtr->UpdateGaugePercent(Percent);
    }
}`,
      },
      {
        point: 2,
        title: "재료 조합으로 레시피 찾기 (순서 무관)",
        file: "Source/OverCooked2/Global/Data/OC2DataSubsystem.cpp",
        url: "https://github.com/PotenupDeaBak/OverCooked2/blob/cc447dc5cff4f0f8fe9ebcc62418bbe2bc6735e1/Source/OverCooked2/Global/Data/OC2DataSubsystem.cpp#L229-L271",
        why: "GameInstanceSubsystem이 DataAsset(OC2DataConfig)에 연결된 레시피 DataTable을 순회하며, 재료 종류·상태가 모두 일치하는 레시피를 찾습니다. 넣은 순서와 관계없이 하나씩 지워가며 대조합니다.",
        code: String.raw`const FRecipeDataRow* UOC2DataSubsystem::GetRecipeByIngredients(const TArray<FCookableIngredient>& Ingredients) const
{
	if (!CachedDataConfig || !CachedDataConfig->RecipeTable || Ingredients.Num() == 0) return nullptr;

	TArray<FRecipeDataRow*> AllRecipes;
	CachedDataConfig->RecipeTable->GetAllRows<FRecipeDataRow>(TEXT("GetRecipeByIngredients"), AllRecipes);

	for (const FRecipeDataRow* Recipe : AllRecipes)
	{
		if (!Recipe) continue;

		if (Recipe->RequireIngredients.Num() != Ingredients.Num()) continue;

		// 모든 재료가 포함되어 있는지 확인 (순서 무관)
		bool bMatch = true;
		TArray<FCookableIngredient> TempRequired = Recipe->RequireIngredients;

		for (const FCookableIngredient& InputIng : Ingredients)
		{
			bool bFound = false;
			for (int32 i = 0; i < TempRequired.Num(); ++i)
			{
				if (TempRequired[i].IngredientType == InputIng.IngredientType &&
					TempRequired[i].IngredientState == InputIng.IngredientState)
				{
					TempRequired.RemoveAt(i);
					bFound = true;
					break;
				}
			}

			if (!bFound)
			{
				bMatch = false;
				break;
			}
		}

		if (bMatch) return Recipe;
	}

	return nullptr;
}`,
      },
      {
        point: 3,
        title: "PlayerState와 메시가 모두 준비된 뒤 외형 적용",
        file: "Source/OverCooked2/Character/OC2Character.cpp",
        url: "https://github.com/PotenupDeaBak/OverCooked2/blob/cc447dc5cff4f0f8fe9ebcc62418bbe2bc6735e1/Source/OverCooked2/Character/OC2Character.cpp#L302-L443",
        why: "서버(PossessedBy)와 클라이언트(OnRep_PlayerState) 양쪽에서 외형 갱신을 시도하되, 팀 인덱스와 메시가 아직 준비되지 않았으면 IsVisualDataReady가 막고 0.1초 뒤 다시 시도합니다.",
        code: String.raw`void AOC2Character::PossessedBy(AController* NewController)
{
    Super::PossessedBy(NewController);

   if (HasAuthority())
   {
      if (AOC2PlayerState* PS = GetPlayerState<AOC2PlayerState>())
      {
         SetTeamColorIndex(PS->GetPlayerIndex());
      }
   }

    UpdatePlayerVisuals();
}

void AOC2Character::OnRep_PlayerState()
{
    Super::OnRep_PlayerState();

   if (HasAuthority())
   {
      if (AOC2PlayerState* PS = GetPlayerState<AOC2PlayerState>())
      {
         SetTeamColorIndex(PS->GetPlayerIndex());
      }
   }

    UpdatePlayerVisuals();
}
// …
bool AOC2Character::IsVisualDataReady() const
{
   if (ResolveTeamColorIndex() < 0)
    {
       return false;
    }

    if (!AppearanceComp || !AppearanceComp->IsMeshInitialized())
    {
      return false;
    }

    return GetMesh() != nullptr;
}`,
      },
    ],
  },

  intereal: {
    repo: "https://github.com/Imeamangryang/InteReal",
    snippets: [
      {
        point: 0,
        title: "도면 JSON 스키마 검증",
        file: "Source/InteReal/Harness/Private/HarnessJsonParser.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Harness/Private/HarnessJsonParser.cpp#L307-L366",
        why: "schema_version · 단위(mm) · 좌표계(중략) · 벽/공간 배열을 먼저 검증하고, 하나라도 다르면 생성하지 않고 오류를 돌려줍니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`bool ValidateTopologyRoot(const TSharedPtr<FJsonObject>& RootObject, FString& OutError)
{
	FString SchemaVersion;
	if (!RootObject->TryGetStringField(TEXT("schema_version"), SchemaVersion))
	{
		OutError = FString::Printf(TEXT("Missing required schema_version. Harness topology import supports only schema_version='%s'."), ExpectedTopologySchemaVersion);
		return false;
	}

	if (!SchemaVersion.Equals(ExpectedTopologySchemaVersion, ESearchCase::CaseSensitive))
	{
		OutError = FString::Printf(TEXT("Unsupported topology schema_version='%s'. Harness topology import supports only schema_version='%s'."), *SchemaVersion, ExpectedTopologySchemaVersion);
		return false;
	}

	FString Unit;
	if (!RootObject->TryGetStringField(TEXT("unit"), Unit) || !Unit.Equals(TEXT("mm"), ESearchCase::IgnoreCase))
	{
		OutError = TEXT("Unsupported topology unit. Harness topology import requires unit='mm'.");
		return false;
	}
// …

	const TArray<TSharedPtr<FJsonValue>>* Walls = nullptr;
	const TArray<TSharedPtr<FJsonValue>>* Spaces = nullptr;
	if (!RootObject->TryGetArrayField(TEXT("walls"), Walls) || !Walls || Walls->Num() == 0)
	{
		OutError = TEXT("Missing required non-empty walls array.");
		return false;
	}
	if (!RootObject->TryGetArrayField(TEXT("spaces"), Spaces) || !Spaces || Spaces->Num() == 0)
	{
		OutError = TEXT("Missing required non-empty spaces array.");
		return false;
	}

	return true;
}`,
      },
      {
        point: 0,
        title: "벽 → 바닥·천장 → 개구부 순서로 생성",
        file: "Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp#L94-L114",
        why: "토폴로지 캐시를 만든 뒤 벽, 바닥·천장 평면, 문·창문 순서로 DynamicMesh를 생성합니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UHarnessGeneratorComponent::RebuildHarnessFromRuntimeData(const FHarnessFloorData& FloorData)
{
    ClearHarness();
    BuildTopologyCaches(FloorData);

    AssembleStructuralWalls(FloorData);
    FabricateDynamicPlanes(FloorData);
    InstallOpeningComponents(FloorData);

    bool bShowCeiling = false;
    if (UWorld* World = GetWorld())
    {
        for (TActorIterator<AViewModeManager> It(World); It; ++It)
        {
            bShowCeiling = (*It)->GetCurrentViewMode() == EHarnessViewMode::FirstPerson;
            break;
        }
    }
    SetCeilingVisibility(bShowCeiling);
    StartHarnessRevealAnimation();
}`,
      },
      {
        point: 1,
        title: "생성물마다 ID 태그 부여",
        file: "Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp#L65-L92",
        why: "생성한 컴포넌트에 유형과 원본 ID(HarnessEntityId=…)를 태그로 붙여, 저장된 편집(Delta)을 다시 불러올 때 같은 대상에 연결합니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UHarnessGeneratorComponent::AddGeneratedComponentTags(UActorComponent* Component, const FString& ComponentType, const FString& EntityId, const TArray<FString>& ExtraMetadataTags) const
{
    if (!Component)
    {
        return;
    }

    Component->ComponentTags.AddUnique(FName(TEXT("HarnessGenerated")));

    if (!ComponentType.IsEmpty())
    {
        Component->ComponentTags.AddUnique(FName(*FString::Printf(TEXT("Harness%s"), *ComponentType)));
        Component->ComponentTags.AddUnique(FName(*FString::Printf(TEXT("HarnessComponentType=%s"), *ComponentType)));
    }

    if (!EntityId.IsEmpty())
    {
        Component->ComponentTags.AddUnique(FName(*FString::Printf(TEXT("HarnessEntityId=%s"), *EntityId)));
    }

    for (const FString& Tag : ExtraMetadataTags)
    {
        if (!Tag.IsEmpty())
        {
            Component->ComponentTags.AddUnique(FName(*Tag));
        }
    }
}`,
      },
      {
        point: 1,
        title: "Base 조립과 Delta 적용 분리",
        file: "Source/InteReal/Harness/Private/HarnessPipelineManager.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Harness/Private/HarnessPipelineManager.cpp#L270-L307",
        why: "원본 도면(Base)으로 건물을 만든 뒤, 사용자 편집(Delta)은 따로 불러와 덮어씁니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UHarnessPipelineManager::AssembleBase(const FString& BaseJson)
{
	if (!GeneratorComp) return;

	FHarnessFloorData FloorData;
	FString Error;
	if (FHarnessJsonParser::ParseFloorDataFromJsonString(BaseJson, FloorData, Error))
	{
		GeneratorComp->BuildHarness(FloorData);
		const FHarnessFloorData& RuntimeFloorData = GeneratorComp->GetCachedFloorData();
		OnFloorPlanDataReady.Broadcast(RuntimeFloorData);
// …
void UHarnessPipelineManager::ApplyDelta(const FString& DeltaJson)
{
	if (!SaveManagerComp) return;

	SaveManagerComp->LoadInteriorState(DeltaJson);
	CaptureCurrentStateAsSavedBaseline();
	OnPipelineLoadFinished.Broadcast();
}`,
      },
      {
        point: 2,
        title: "실서버 HTTP와 Mock JSON을 같은 인터페이스로",
        file: "Source/InteReal/Network/InteRealNetworkSubsystem.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Network/InteRealNetworkSubsystem.cpp#L1178-L1211",
        why: "bUseMockData면 로컬 JSON 파일을, 아니면 HTTP 응답을 읽어 같은 Delegate로 돌려줍니다. 호출하는 쪽은 차이를 모릅니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UInteRealNetworkSubsystem::FetchLatestDelta(int32 PlanId, FOnDeltaReceived OnComplete)
{
    if (bUseMockData)
    {
        FString FilePath = GetNetworkMockTestDataFilePath(GetMockDeltaFileName(PlanId));
        FString JsonContent;
        if (FFileHelper::LoadFileToString(JsonContent, *FilePath))
        {
            OnComplete.ExecuteIfBound(true, JsonContent);
        }
        else
        {
            OnComplete.ExecuteIfBound(true, TEXT("{}"));
        }
        return;
    }

    auto Req = CreateRequest(TEXT("GET"), BuildEndpoint(LatestDeltaEndpointFormat, PlanId));
    Req->OnProcessRequestComplete().BindLambda([OnComplete](FHttpRequestPtr, FHttpResponsePtr R, bool S) {
        LogResponse(R, S);
        if (IsSuccessfulResponse(R, S)) {
            const FString Payload = ExtractJsonPayload(R->GetContentAsString(), {
                TEXT("delta_json"),
                TEXT("delta"),
                TEXT("style_json"),
                TEXT("style"),
                TEXT("json"),
                TEXT("data")
            });
            OnComplete.ExecuteIfBound(true, Payload);
        } else OnComplete.ExecuteIfBound(false, TEXT(""));
    });
    Req->ProcessRequest();
}`,
      },
      {
        point: 2,
        title: "Base 수신 → Delta 요청 순서 보장",
        file: "Source/InteReal/Network/ViewModel/InteRealPlanViewModel.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Network/ViewModel/InteRealPlanViewModel.cpp#L262-L288",
        why: "Base 도면을 받은 Delegate 안에서 조립을 마친 뒤 최신 Delta를 요청하므로, 편집 데이터가 항상 건물 생성 뒤에 적용됩니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UInteRealPlanViewModel::OnBaseTopologyReceived(bool bSuccess, const FString& TopologyJson)
{
    if (bSuccess) {
        if (auto* Pipeline = GetWorld()->GetSubsystem<UHarnessPipelineManager>()) {
            Pipeline->AssembleBase(TopologyJson);
        }
        if (!bLoadLatestDeltaAfterTopology)
        {
            SetIsBusy(false);
            return;
        }
        bLoadLatestDeltaAfterTopology = false;
        RefreshLatestDelta(); // 2단계: 가구 데이터 로드
    } else { bLoadLatestDeltaAfterTopology = false; SetIsBusy(false); }
}

void UInteRealPlanViewModel::OnDeltaReceived(bool bSuccess, const FString& DeltaJson)
{
    SetIsBusy(false);
    if (bSuccess) {
        PreviousVersionDeltaJson = CurrentVersionDeltaJson;
        CurrentVersionDeltaJson = DeltaJson;
        if (auto* Pipeline = GetWorld()->GetSubsystem<UHarnessPipelineManager>()) {
            Pipeline->ApplyDelta(DeltaJson);
        }
    }
}`,
      },
      {
        point: 3,
        title: "숨긴 천장도 그림자는 유지 (빛샘 방지)",
        file: "Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp",
        url: "https://github.com/Imeamangryang/InteReal/blob/f6fd46698afb5ff5ccdc96b13b27c03b270d7802/Source/InteReal/Harness/Private/HarnessGeneratorComponent.cpp#L116-L150",
        why: "탑뷰에서 천장을 숨겨도 bCastHiddenShadow로 그림자는 계속 드리워 실내로 빛이 새지 않게 합니다. 숨긴 천장의 충돌은 꺼서 클릭을 막지 않습니다. (Perforce에서 옮긴 저장소라 줄 단위 작성자는 Git으로 확인할 수 없어, 본인 커밋 메시지로 담당 범위를 확인했습니다.)",
        code: String.raw`void UHarnessGeneratorComponent::SetCeilingVisibility(bool bVisible)
{
    AActor* Owner = GetOwner();
    if (!Owner)
    {
        return;
    }

    TArray<UActorComponent*> CeilingComponents = Owner->GetComponentsByTag(UPrimitiveComponent::StaticClass(), FName(TEXT("Ceiling")));
    for (UActorComponent* Component : CeilingComponents)
    {
        if (UPrimitiveComponent* Primitive = Cast<UPrimitiveComponent>(Component))
        {
            Primitive->SetVisibility(true, true);
            Primitive->SetHiddenInGame(!bVisible, true);
            Primitive->SetCastShadow(true);
            Primitive->bCastHiddenShadow = true;
            Primitive->SetAffectDistanceFieldLighting(true);
            Primitive->SetVisibleInRayTracing(true);

            // 1인칭 모드에서만 천장을 표시/충돌 대상으로 사용한다.
            // 탑뷰, 편집, 배치 모드에서는 보이지 않는 천장 콜리전이 ECC_Visibility 클릭 트레이스를 막지 않도록 Query collision을 꺼 둔다.
            if (bVisible)
            {
                Primitive->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
                Primitive->SetCollisionResponseToAllChannels(ECR_Block);
                Primitive->SetCollisionResponseToChannel(ECC_Pawn, ECR_Ignore);
            }
            else
            {
                Primitive->SetCollisionEnabled(ECollisionEnabled::NoCollision);
            }
        }
    }
}`,
      },
    ],
  },

  furi: {
    repo: "https://github.com/Furi-Imitation/Furi",
    snippets: [
      {
        point: 0,
        title: "콤보 구간에서만 다음 섹션 예약",
        file: "Source/Furi/GamePlayAbilitySystem/GameplayAbilities/GA_Attack.cpp",
        url: "https://github.com/Furi-Imitation/Furi/blob/3fe42c1c65f7be5beeeae9ec8fbb68379cf09e12/Source/Furi/GamePlayAbilitySystem/GameplayAbilities/GA_Attack.cpp#L17-L100",
        why: "LocalPredicted로 입력 반응을 확보하고, AnimNotifyState가 보내는 Combo.Start/End 이벤트 사이에서만 다음 몽타주 섹션을 한 번 예약합니다.",
        code: String.raw`	NetExecutionPolicy = EGameplayAbilityNetExecutionPolicy::LocalPredicted;
// …
void UGA_Attack::InputPressed(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo,
                              const FGameplayAbilityActivationInfo ActivationInfo)
{
	Super::InputPressed(Handle, ActorInfo, ActivationInfo);

	if (bComboWindowOpened && !bNextComboReserved && CurrentComboIndex < 3)
	{
		bNextComboReserved = true;

		if (AActor* MyAvatar = GetAvatarActorFromActorInfo())
		{
			RotateTowardsClosestEnemy(MyAvatar, AttackRange);
		}

		FName CurrentSection = *FString::Printf(TEXT("Attack%d"), CurrentComboIndex);
		FName NextSection = *FString::Printf(TEXT("Attack%d"), CurrentComboIndex + 1);

		MontageSetNextSectionName(CurrentSection, NextSection);
		CurrentComboIndex++;
	}
}

void UGA_Attack::OnComboEventReceived(FGameplayEventData Payload)
{
	FGameplayTag EventTag = Payload.EventTag;

	if (EventTag.MatchesTag(FGameplayTag::RequestGameplayTag(FName("Combo.Start"))))
	{
		bComboWindowOpened = true;
		bNextComboReserved = false;
	}
	else if (EventTag.MatchesTag(FGameplayTag::RequestGameplayTag(FName("Combo.End"))))
	{
		bComboWindowOpened = false;
	}
	else if (EventTag.MatchesTag(HitCheckEventTag))
	{
		PerformHitCheck();
	}
}`,
      },
      {
        point: 1,
        title: "Custom EffectContext의 NetSerialize",
        file: "Source/Furi/GamePlayAbilitySystem/FuriAbilityTypes.cpp",
        url: "https://github.com/Furi-Imitation/Furi/blob/3fe42c1c65f7be5beeeae9ec8fbb68379cf09e12/Source/Furi/GamePlayAbilitySystem/FuriAbilityTypes.cpp#L3-L30",
        why: "부모 컨텍스트를 먼저 직렬화한 뒤, 데미지 정보는 필요한 필드만 보냅니다. enum은 uint8로 줄여 전송합니다. (커밋 5c8202d · 2026-03-28)",
        code: String.raw`bool FFuriGameplayEffectContext::NetSerialize(FArchive& Ar, class UPackageMap* Map, bool& bOutSuccess)
{
    // 1. 부모 클래스(기본 GAS 정보: Instigator, Target 등)의 데이터를 먼저 직렬화합니다.
    FGameplayEffectContext::NetSerialize(Ar, Map, bOutSuccess);

    // 2. 커스텀 데이터(DamageInfo) 직렬화
    // 네트워크 대역폭 절약을 위해 필요한 데이터만 선별적으로 아카이브(Ar)에 넣습니다.
    Ar << DamageInfo.Amount; // 데미지 수치 전송

    // Enum(열거형)은 uint8로 변환하여 최소한의 용량으로 전송합니다.
    uint8 DamageTypeInt = static_cast<uint8>(DamageInfo.DamageType);
    Ar << DamageTypeInt;
    DamageInfo.DamageType = static_cast<EFuriDamageType>(DamageTypeInt);

    uint8 DamageResponseInt = static_cast<uint8>(DamageInfo.DamageResponse);
    Ar << DamageResponseInt;
    DamageInfo.DamageResponse = static_cast<EFuriDamageResponse>(DamageResponseInt);

    // 불리언(bool) 값들을 비트 단위로 전송
    Ar << DamageInfo.bShouldDamageInvincible; // 무적 무시 여부
    Ar << DamageInfo.bCanBeBlocked;            // 가드 가능 여부
    Ar << DamageInfo.bCanBeParried;            // 패링 가능 여부
    Ar << DamageInfo.bShouldForceInterrupt;    // 강제 경직 발생 여부

    bOutSuccess = true;
    return true;
}`,
      },
      {
        point: 2,
        title: "GameplayTag로 DataAsset 수치 조회 → SetByCaller 주입",
        file: "Source/Furi/GamePlayAbilitySystem/GameplayAbilities/FuriGameplayAbilityBase.cpp",
        url: "https://github.com/Furi-Imitation/Furi/blob/3fe42c1c65f7be5beeeae9ec8fbb68379cf09e12/Source/Furi/GamePlayAbilitySystem/GameplayAbilities/FuriGameplayAbilityBase.cpp#L25-L97",
        why: "어빌리티 태그로 DataAsset에서 스킬 데이터를 찾고, 공통 쿨다운 Effect에 SetByCaller로 시간을 넣습니다. 스킬마다 Effect를 따로 만들지 않아도 됩니다.",
        code: String.raw`bool UFuriGameplayAbilityBase::GetCurrentSkillData(FFuriSkillData& OutData, const FGameplayAbilityActorInfo* InActorInfo) const
{
    // 🌟 핵심: 파라미터로 정보가 들어왔으면 그걸 쓰고, 아니면 내 정보를 씁니다.
    const FGameplayAbilityActorInfo* TargetActorInfo = InActorInfo ? InActorInfo : CurrentActorInfo;
    
    // 타겟 정보나 아바타 액터가 비어있으면 안전하게 빠져나갑니다 (크래시 방지)
    if (!TargetActorInfo || !TargetActorInfo->AvatarActor.IsValid())
    {
        return false;
    }

    if (AGasCharacterBase* MyChar = Cast<AGasCharacterBase>(TargetActorInfo->AvatarActor.Get()))
    {
        if (UFuriSkillDataAsset* DA = MyChar->GetSkillUIData())
        {
            if (AbilityTags.IsValid() && DA->GetSkillDataByTag(AbilityTags.First(), OutData))
            {
                return true;
            }
        }
    }
    return false;
}
// …
void UFuriGameplayAbilityBase::ApplyCooldown(const FGameplayAbilitySpecHandle Handle, const FGameplayAbilityActorInfo* ActorInfo, const FGameplayAbilityActivationInfo ActivationInfo) const
{
    UGameplayEffect* CooldownGE = GetCooldownGameplayEffect();
    if (CooldownGE)
    {
        FGameplayEffectSpecHandle SpecHandle = MakeOutgoingGameplayEffectSpec(CooldownGE->GetClass(), GetAbilityLevel());

        // 🌟 Data Asset에서 쿨타임 시간을 가져와 SetByCaller로 주입합니다!
        FFuriSkillData SkillData;
        if (GetCurrentSkillData(SkillData) && SpecHandle.IsValid())
        {
            SpecHandle.Data.Get()->SetSetByCallerMagnitude(FGameplayTag::RequestGameplayTag(FName("Data.Cooldown.Duration")), SkillData.CooldownDuration);
        }

       (void)ApplyGameplayEffectSpecToOwner(Handle, ActorInfo, ActivationInfo, SpecHandle);
    }
}`,
      },
    ],
  },

  gearofthree: {
    repo: "https://github.com/GearOfThree/Gear_3",
    snippets: [
      {
        point: 0,
        title: "공통 NPC 계층의 적대 판정",
        file: "Source/GearOfThree/EnemyNPC/Private/GearCharacter.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/GearCharacter.cpp#L18-L40",
        why: "TeamSide만으로 적대 관계를 판단합니다. Player와 Ally는 팀이 달라도 동맹으로 처리해 적·아군 NPC가 같은 함수를 씁니다.",
        code: String.raw`bool AGearCharacter::IsHostile(AGearCharacter* OtherCharacter) const
{
	// 대상이 없거나 나 자신이면 적이 아님
	if (!OtherCharacter || OtherCharacter == this) return false;

	ETeamSide OtherTeam = OtherCharacter->GetTeamSide();

	// 소속이 없는(None) 대상은 무시
	if (TeamSide == ETeamSide::None || OtherTeam == ETeamSide::None) return false;

	// 같은 팀이면 당연히 적이 아님
	if (TeamSide == OtherTeam) return false;

	// Player와 Ally는 서로 팀이 달라도 적이 아님 (동맹 관계)
	if ((TeamSide == ETeamSide::Player && OtherTeam == ETeamSide::Ally) ||
		(TeamSide == ETeamSide::Ally && OtherTeam == ETeamSide::Player))
	{
		return false;
	}
	
	// 위 조건에 안 걸렸고 서로 팀이 다르다면? 무조건 적(Enemy)임
	return true;
}`,
      },
      {
        point: 0,
        title: "1초 주기 Target Evaluator",
        file: "Source/GearOfThree/EnemyNPC/Private/STE_TargetSelector.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/STE_TargetSelector.cpp#L6-L57",
        why: "StateTree Evaluator가 1초마다만 탐색합니다. 적군은 가까운 플레이어를 우선하고, 아군은 가장 가까운 적을 타깃으로 잡습니다.",
        code: String.raw`void FSTE_TargetSelector::Tick(FStateTreeExecutionContext& Context, const float DeltaTime) const
{
	FInstanceDataType& InstanceData = Context.GetInstanceData<FInstanceDataType>(*this);
	
	// 흘러간 시간(DeltaTime)을 누적합니다.
	InstanceData.TimeSinceLastUpdate += DeltaTime;

	// 누적된 시간이 1초(1.0f)가 안 되었다면? 
	// 무거운 탐색 연산을 하지 않고 그냥 함수를 종료(return)합니다!
	if (InstanceData.TimeSinceLastUpdate < 1.0f)
	{
		return; 
	}
	// 1초가 지났다면, 다음 1초를 세기 위해 타이머를 다시 0으로 돌려놓습니다.
	InstanceData.TimeSinceLastUpdate = 0.0f;
	
	ANPCCharacter* Owner = Cast<ANPCCharacter>(Context.GetOwner());
	if (!Owner) return;

	ACharacter* Player = UGameplayStatics::GetPlayerCharacter(Context.GetWorld(), 0);
	AActor* FinalTarget = nullptr;

	// 적군인지 아군인지 분기
	if (Owner->TeamSide == ETeamSide::Enemy)
	{
		// 적군 로직
		float DistanceToPlayer = Owner->GetDistanceTo(Player);
		if (DistanceToPlayer <= InstanceData.PlayerPriorityRange)
		{
			FinalTarget = Player; // 플레이어가 가까우면 플레이어 공격
		}
		else
		{
			FinalTarget = Owner->FindClosestEnemy(); // 멀면 근처 아군 NPC 검색
			if (!FinalTarget) FinalTarget = Player;
		}
	}
	else if (Owner->TeamSide == ETeamSide::Ally)
	{
		// 아군 로직
		FinalTarget = Owner->FindClosestEnemy(); 
		// 적군이 하나도 없다면? FinalTarget은 nullptr가 됨
	}
	UE_LOG(LogTemp, Error, TEXT("Final Target: %s"), *GetNameSafe(FinalTarget));

	//Evaluator 자체 출력 데이터 업데이트 (State Tree 내부 바인딩용)
	InstanceData.SelectedTarget = FinalTarget;

	//주인 캐릭터의 변수 업데이트 (무기 조준용)
	Owner->SetCurrentTargetActor(FinalTarget);
	
}`,
      },
      {
        point: 1,
        title: "EQS로 엄폐 지점 찾고 이동",
        file: "Source/GearOfThree/EnemyNPC/Private/GearAIController.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/GearAIController.cpp#L4-L34",
        why: "엄폐 EQS를 비동기로 실행하고, 가장 좋은 지점이 나오면 그 위치로 이동합니다. 람다에서는 WeakPtr로 컨트롤러 유효성을 확인합니다.",
        code: String.raw`void AGearAIController::FindCoverLocation(UEnvQuery* InCoverQuery)
{
	UE_LOG(LogTemp, Log, TEXT("🎯 [STEP 3] GearAIController: FindCoverLocation Started"));

	FEnvQueryRequest QueryRequest(InCoverQuery, GetPawn());
	TWeakObjectPtr<AGearAIController> WeakThis = this;

	FQueryFinishedSignature FinishDelegate = FQueryFinishedSignature::CreateLambda(
	   [WeakThis, this](TSharedPtr<FEnvQueryResult> Result)
	   {
		  if (AGearAIController* ValidThis = WeakThis.Get())
		  {
			 if (Result.IsValid() && Result->IsSuccessful())
			 {
				FVector BestLocation = Result->GetItemAsLocation(0);
				UE_LOG(LogTemp, Warning, TEXT("✅ [STEP 4] EQS Found Cover! Moving to: %s"), *BestLocation.ToString());
			 	// BestLocation 지점에 높이 100, 반지름 20인 빨간색 기둥을 5초 동안 그립니다.
				//FVector ColumnTop = BestLocation + FVector(0.f, 0.f, 100.f);
			 	//DrawDebugCylinder(GetWorld(), BestLocation, ColumnTop, 20.f, 12, FColor::Red, false, 5.f);
				ValidThis->MoveToLocation(BestLocation);
			 }
			 else
			 {
				UE_LOG(LogTemp, Error, TEXT("❌ [STEP 4] EQS FAILED to find any cover points!"));
			 }
		  }
	   }
	);

	QueryRequest.Execute(EEnvQueryRunMode::SingleResult, FinishDelegate);
}`,
      },
      {
        point: 1,
        title: "도착하면 Crouch (StateTree Task)",
        file: "Source/GearOfThree/EnemyNPC/Private/STT_CoverTarget.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/STT_CoverTarget.cpp#L37-L75",
        why: "0.1초 주기로 이동 상태를 확인해, 출발 후 멈추면(도착) Crouch합니다. 2초 안에 출발하지 못하면 실패로 돌려 다른 State로 넘깁니다.",
        code: String.raw`EStateTreeRunStatus FSTT_CoverTarget::Tick(FStateTreeExecutionContext& Context, const float DeltaTime) const
{
    FInstanceDataType& InstanceData = Context.GetInstanceData<FInstanceDataType>(*this);
    InstanceData.TimeSinceLastUpdate += DeltaTime;
    InstanceData.TotalTimeInState += DeltaTime;

    if (InstanceData.TimeSinceLastUpdate < 0.1f) return EStateTreeRunStatus::Running;
    InstanceData.TimeSinceLastUpdate = 0.0f;

    ANPCCharacter* Owner = Cast<ANPCCharacter>(Context.GetOwner());
    if (!Owner) return EStateTreeRunStatus::Failed;

    AGearAIController* GearAIC = Cast<AGearAIController>(Owner->GetController());
    if (!GearAIC) return EStateTreeRunStatus::Failed;

    // 이동 시작 및 완료 체크 로직
    if (!InstanceData.bHasStartedMoving)
    {
        if (GearAIC->GetMoveStatus() != EPathFollowingStatus::Idle)
        {
            InstanceData.bHasStartedMoving = true;
        }
        else if (InstanceData.TotalTimeInState > 2.0f)
        {
            return EStateTreeRunStatus::Failed;
        }
    }
    else if (GearAIC->GetMoveStatus() == EPathFollowingStatus::Idle)
    {
        if (!Owner->bIsCrouched) 
        {
            Owner->Crouch();
        }

        return EStateTreeRunStatus::Running; 
    }

    return EStateTreeRunStatus::Running;
}`,
      },
      {
        point: 2,
        title: "충돌 법선 기반 반사",
        file: "Source/GearOfThree/EnemyNPC/Private/BuzzKillProjectile.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/BuzzKillProjectile.cpp#L222-L235",
        why: "직전 프레임 속도를 표면 법선으로 반사(R = V − 2(V·n)n)하고, 법선 방향으로 1cm 밀어내 같은 면에 다시 부딪히지 않게 합니다.",
        code: String.raw`    FVector IncomingVelocity = LastFrameVelocity;
    FVector Normal = Hit.ImpactNormal;

    float DotProduct = FVector::DotProduct(IncomingVelocity, Normal);
    FVector ReflectedVelocity = IncomingVelocity - (2 * DotProduct * Normal);
    ReflectedVelocity *= Bounciness;

    if (ProjectileMesh)
    {
        ProjectileMesh->SetPhysicsLinearVelocity(ReflectedVelocity);
    }

    FVector Nudge = Normal * 1.0f;
    SetActorLocation(GetActorLocation() + Nudge);`,
      },
      {
        point: 2,
        title: "Actor Pool에서 발사체 꺼내기",
        file: "Source/GearOfThree/EnemyNPC/Private/GearWeaponBase.cpp",
        url: "https://github.com/GearOfThree/Gear_3/blob/495144716beada265e92b17be4cfad0e75031f6d/Source/GearOfThree/EnemyNPC/Private/GearWeaponBase.cpp#L46-L77",
        why: "쉬고 있는 발사체를 재사용하고, 모두 사용 중일 때만 하나를 새로 만들어 Pool에 추가합니다.",
        code: String.raw`AGearProjectile* AGearWeaponBase::GetPooledProjectile()
{
	for (AGearProjectile* Proj : ProjectilePool)
	{
		if (Proj && !Proj->bIsActive)
		{
			return Proj;
		}
	}

	// 2. 만약 20발이 전부 날아가고 있어서 빈 총알이 하나도 없다면? (안전 장치)
	// 에러가 나지 않게 실시간으로 하나 더 스폰해서 풀(Pool)을 늘려줍니다.
	if (ProjectileClass)
	{
		// … SpawnParams 설정
		AGearProjectile* ExtraProj = GetWorld()->SpawnActor<AGearProjectile>(ProjectileClass, FVector::ZeroVector, FRotator::ZeroRotator, SpawnParams);
		if (ExtraProj)
		{
			ExtraProj->DeactivateProjectile();
			ProjectilePool.Add(ExtraProj);
			return ExtraProj;
		}
	}

	return nullptr;
}`,
      },
    ],
  },
};
